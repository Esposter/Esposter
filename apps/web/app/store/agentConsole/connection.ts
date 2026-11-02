import type { AssistantLine } from "@/models/agentConsole/AssistantLine";
import type { Connection } from "@/models/agentConsole/Connection";
import type { ConnectionSocket } from "@/models/agentConsole/ConnectionSocket";
import type { Pairing } from "@/models/agentConsole/Pairing";
import type { SideChatQuestion } from "@/models/agentConsole/SideChatQuestion";
import type { Attachment, Command, ServerMessage } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { checkIsCommandTooLarge } from "@/services/agentConsole/checkIsCommandTooLarge";
import { checkIsHostProofValid } from "@/services/agentConsole/checkIsHostProofValid";
import { checkIsPairingProofValid } from "@/services/agentConsole/checkIsPairingProofValid";
import { checkIsProofPortMismatched } from "@/services/agentConsole/checkIsProofPortMismatched";
import {
  AGGREGATE_STATUS_ORDER,
  LOCAL_HOST_ADDRESS,
  MAX_RECONNECT_DELAY_MS,
  MIN_RECONNECT_DELAY_MS,
} from "@/services/agentConsole/constants";
import { reactToEvents } from "@/services/agentConsole/reactToEvents";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { toPromptCommand } from "@/services/agentConsole/toPromptCommand";
import { getFileSize } from "@/services/file/getFileSize";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useAgentConsoleFileStore } from "@/store/agentConsole/file";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleShellStore } from "@/store/agentConsole/shell";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";
import { useAlertStore } from "@/store/alert";
import {
  exhaustiveGuard,
  getOrCreate,
  getResult,
  getResultAsync,
  getSynchronizedFunction,
  noop,
} from "@esposter/shared";
import {
  CommandType,
  HandshakeMessageType,
  HOST_SCHEME,
  HostCloseCode,
  MESSAGE_MAX_BYTE_LENGTH,
  PAIRING_CODE_BYTE_LENGTH,
  PAIRING_CODE_PARAMETER,
  SCHEME_PAIRING_CODE_DURATION_MS,
  serverMessageSchema,
  ServerMessageType,
  SessionState,
} from "agent-console-server/contracts";

// One socket per paired host — this computer's, and each machine of the reader's own — each with a credential of its
// Own. Every connect proves the host first: the page sends a fresh challenge and sends its credential only once the
// Host has signed it with the key the page was given when it paired, so a program squatting on the port learns
// Nothing. A host that goes away without a word is retried with a backoff capped at a constant, so starting it again
// Is all it takes for the page to come back, with every open session's log replayed. A host that says it is stopping
// Was stopped on purpose, and is reconnected to only when asked. Each host's state is its own, so one stopping leaves
// The others as they were
export const useAgentConsoleConnectionStore = defineStore("agentConsole/connection", () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  const { storeEvents, storeSessionReset, storeSessions } = agentConsoleSessionStore;
  const agentConsoleShellStore = useAgentConsoleShellStore();
  const { storeShellOpened, storeShellOutput, storeShellsClosed } = agentConsoleShellStore;
  const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
  const agentConsoleFileStore = useAgentConsoleFileStore();
  const { storeFiles, storeOpenedFile } = agentConsoleFileStore;
  const connections = useLocalStorage<Connection[]>(LocalStorageKey.AgentConsoleConnections, []);
  const { getDataRef: getStatusRef } = useDataMap("", ConnectionStatus.Connecting);
  const pairing = shallowRef<Pairing>();
  // A host a pairing link named, shown to the reader rather than paired with: a link is anyone's to craft, and one
  // That paired on its own would send everything typed into the console to whichever host its author runs
  const linkedHost = ref({ address: "", code: "" });
  const theme = AgentConsoleThemeMap[AgentConsoleThemeType.Default];
  // The commands this tab sent that open a session or a shell: what they open is what this tab moves to
  const openingCommandIds = new Set<string>();
  // The forks the side chat sent, which open its session rather than moving the tab to one, each with the question it
  // Was sent to ask, so a fork that fails clears only its own question
  const sideChatCommandIds = new Map<string, SideChatQuestion | undefined>();
  // The Ask Claude lines a new session was started with, held until that session opens so the line is its first prompt
  const assistantLineCommandIds = new Map<string, string>();
  const connectionSocketMap = new Map<string, ConnectionSocket>();
  const getConnectionSocket = (connectionId: string) =>
    getOrCreate(connectionSocketMap, connectionId, (): ConnectionSocket => ({
      connectedAt: new Date(),
      reconnectDelay: MIN_RECONNECT_DELAY_MS,
      reconnectTimeoutId: 0,
    }));

  const connectionStatuses = computed(() =>
    connections.value.map((connection) => ({ connection, status: getStatusRef(connection.id).value })),
  );
  // The page as a whole: unpaired with no host, and otherwise as its best-placed host
  const status = computed(() => {
    const statuses = new Set([
      ...connectionStatuses.value.map(({ status: connectionStatus }) => connectionStatus),
      ...(pairing.value ? [ConnectionStatus.Connecting] : []),
    ]);
    return AGGREGATE_STATUS_ORDER.find((aggregateStatus) => statuses.has(aggregateStatus)) ?? ConnectionStatus.Unpaired;
  });
  const connectedConnections = computed(() =>
    connectionStatuses.value
      .filter(({ status: connectionStatus }) => connectionStatus === ConnectionStatus.Connected)
      .map(({ connection }) => connection),
  );

  const receive = (connectionId: string, serverMessage: ServerMessage) => {
    switch (serverMessage.type) {
      // The handshake's answers, which a proven host has no reason to send again
      case ServerMessageType.Authenticated:
      case ServerMessageType.Paired:
      case ServerMessageType.Proof:
        break;
      case ServerMessageType.CommandError: {
        openingCommandIds.delete(serverMessage.commandId);
        assistantLineCommandIds.delete(serverMessage.commandId);
        // A fork that failed to open leaves its question unasked, so the reader can send it again. A question the
        // Drawer has held since, which this fork never carried, is not this fork's to clear
        const failedQuestion = sideChatCommandIds.get(serverMessage.commandId);
        if (
          sideChatCommandIds.delete(serverMessage.commandId) &&
          failedQuestion === agentConsoleSideChatStore.pendingQuestion
        )
          agentConsoleSideChatStore.pendingQuestion = undefined;
        // oxlint-disable-next-line error-alert/no-raw-error-alert -- a host's command error is not a tRPC rejection, so no error link has shown it
        createAlert(serverMessage.message, "error");
        break;
      }
      case ServerMessageType.Events: {
        const addedEvents = storeEvents(serverMessage.sessionId, serverMessage.events);
        const sessionTitle =
          agentConsoleSessionStore.sessions.find(({ id }) => id === serverMessage.sessionId)?.title ?? "";
        reactToEvents(theme, sessionTitle, addedEvents, getConnectionSocket(connectionId).connectedAt);
        break;
      }
      case ServerMessageType.FileContent:
        storeOpenedFile(serverMessage);
        break;
      case ServerMessageType.Files:
        storeFiles(serverMessage.files);
        break;
      // The host was stopped from its own window, so its sessions end with it and the page waits to be asked to
      // Reconnect rather than retrying a host that is not coming back on its own
      case ServerMessageType.HostStopping:
        getStatusRef(connectionId).value = ConnectionStatus.Stopped;
        storeShellsClosed((shell) => shell.connectionId === connectionId);
        storeSessions(
          connectionId,
          agentConsoleSessionStore.sessions
            .filter((session) => session.connectionId === connectionId)
            .map(({ cwd, id, lastActivityAt, title }) => ({
              cwd,
              id,
              lastActivityAt,
              state: SessionState.Closed,
              title,
            })),
        );
        break;
      case ServerMessageType.SessionOpened:
        if (openingCommandIds.delete(serverMessage.commandId)) {
          agentConsoleSessionStore.currentSessionId = serverMessage.sessionId;
          // A line held for the session this command started is its first prompt, sent once the session is open
          const assistantLine = assistantLineCommandIds.get(serverMessage.commandId);
          if (assistantLine !== undefined) {
            assistantLineCommandIds.delete(serverMessage.commandId);
            sendCommand(toPromptCommand(serverMessage.sessionId, assistantLine, []), connectionId);
          }
        } else if (sideChatCommandIds.delete(serverMessage.commandId))
          storeSideChatOpened(connectionId, serverMessage.sessionId);
        break;
      case ServerMessageType.SessionReset:
        storeSessionReset(serverMessage.sessionId);
        break;
      case ServerMessageType.Sessions:
        storeSessions(connectionId, serverMessage.sessions);
        break;
      case ServerMessageType.ShellClosed:
        storeShellsClosed(({ id }) => id === serverMessage.shellId);
        break;
      case ServerMessageType.ShellOpened:
        storeShellOpened({ connectionId, id: serverMessage.shellId, sessionId: serverMessage.sessionId });
        if (openingCommandIds.delete(serverMessage.commandId))
          agentConsoleShellStore.currentShellId = serverMessage.shellId;
        break;
      case ServerMessageType.ShellOutput:
        storeShellOutput(serverMessage.shellId, serverMessage.data);
        break;
      default:
        exhaustiveGuard(serverMessage);
    }
  };

  const markConnected = (connectionId: string) => {
    const connectionSocket = getConnectionSocket(connectionId);
    connectionSocket.connectedAt = new Date();
    connectionSocket.reconnectDelay = MIN_RECONNECT_DELAY_MS;
    getStatusRef(connectionId).value = ConnectionStatus.Connected;
  };

  const disconnectOne = (connectionId: string) => {
    const connectionSocket = connectionSocketMap.get(connectionId);
    if (!connectionSocket) return;
    window.clearTimeout(connectionSocket.reconnectTimeoutId);
    connectionSocketMap.delete(connectionId);
    connectionSocket.webSocket?.close();
  };

  const disconnect = () => {
    for (const connectionId of connectionSocketMap.keys()) disconnectOne(connectionId);
  };
  // What the page shows of a host leaves with it. With no host left, the console closes on the first screen
  const unpair = (connectionId?: string) => {
    const removedConnectionIds = connectionId === undefined ? connections.value.map(({ id }) => id) : [connectionId];
    for (const removedConnectionId of removedConnectionIds) {
      disconnectOne(removedConnectionId);
      storeSessions(removedConnectionId, []);
    }
    storeShellsClosed((shell) => removedConnectionIds.includes(shell.connectionId));
    connections.value = connections.value.filter(({ id }) => !removedConnectionIds.includes(id));
    if (!agentConsoleSessionStore.sessions.some(({ id }) => id === agentConsoleSessionStore.currentSessionId))
      agentConsoleSessionStore.currentSessionId = "";
    if (connections.value.length > 0) return;
    // A pairing still under way leaves with the last host, its socket closed too, or it would admit the host it reaches
    if (pairing.value) disconnectOne(pairing.value.connectionId);
    pairing.value = undefined;
    agentConsolePanelStore.isConsoleOpen = false;
    agentConsolePanelStore.isPauseMenuOpen = false;
  };
  // A pairing that can no longer succeed leaves the page as it was before it: on the host it re-paired, if any
  const endPairing = (connectionId: string, message: string) => {
    pairing.value = undefined;
    createAlert(message, "error");
    if (connections.value.some(({ id }) => id === connectionId)) connectOne(connectionId);
  };

  const connectOne = (connectionId: string) => {
    const connectionSocket = getConnectionSocket(connectionId);
    window.clearTimeout(connectionSocket.reconnectTimeoutId);
    const connectionPairing = pairing.value?.connectionId === connectionId ? pairing.value : undefined;
    const connection = connections.value.find(({ id }) => id === connectionId);
    const address = connectionPairing?.address ?? connection?.address;
    if (address === undefined) return;
    // An address that is not a WebSocket URL throws here rather than failing to connect. Retrying it could never
    // Succeed, so it is refused
    getResult(() => new WebSocket(address)).match(
      (socket) => {
        connectionSocket.webSocket = socket;
        const nonce = crypto.randomUUID();
        // Until the host has proved itself nothing is sent to it — a paired host by signing the challenge, a host being
        // Paired by answering it with a MAC under the pairing code, which crosses only after — and until it has admitted
        // The page, or paired it, nothing it sends is taken
        let isHostProven = false;
        let isAdmitted = false;
        socket.addEventListener("open", () => {
          socket.send(JSON.stringify({ nonce, type: HandshakeMessageType.Challenge }));
        });
        socket.addEventListener(
          "message",
          getSynchronizedFunction(async (event: MessageEvent) => {
            await getResultAsync(async () => {
              // oxlint-disable-next-line no-restricted-properties -- the server message schema validates the payload and coerces its dates, the pair openspec/specs/architecture/serialization/README.md names
              const serverMessage = serverMessageSchema.parse(JSON.parse(String(event.data)));
              if (isAdmitted) {
                receive(connectionId, serverMessage);
                return;
              }

              if (serverMessage.type === ServerMessageType.Paired && connectionPairing && isHostProven) {
                const { credential, publicKey } = serverMessage;
                const pairedConnection: Connection = { address, credential, id: connectionId, publicKey };
                connections.value = connection
                  ? connections.value.map((oldConnection) =>
                      oldConnection.id === connectionId ? pairedConnection : oldConnection,
                    )
                  : [...connections.value, pairedConnection];
                pairing.value = undefined;
                isAdmitted = true;
                markConnected(connectionId);
              } else if (serverMessage.type === ServerMessageType.Proof && connectionPairing)
                await getResultAsync(() =>
                  checkIsPairingProofValid(
                    connectionPairing.code,
                    serverMessage.port,
                    nonce,
                    serverMessage.pairingProofs,
                  ),
                ).match(
                  (isValid) => {
                    // A host that does not hold this code — not yet started with it, or another program on the port —
                    // Is left without it: the pairing is refused here as the host would refuse it
                    if (!isValid || checkIsProofPortMismatched(address, serverMessage.port)) {
                      socket.close(HostCloseCode.PairingRefused);
                      return;
                    }

                    isHostProven = true;
                    socket.send(JSON.stringify({ code: connectionPairing.code, type: HandshakeMessageType.Pair }));
                  },
                  () => {
                    socket.close(HostCloseCode.PairingRefused);
                  },
                );
              else if (serverMessage.type === ServerMessageType.Proof && connection)
                await getResultAsync(() =>
                  checkIsHostProofValid(connection.publicKey, serverMessage.port, nonce, serverMessage.signature),
                ).match(
                  (isValid) => {
                    if (!isValid || checkIsProofPortMismatched(address, serverMessage.port)) {
                      socket.close();
                      return;
                    }

                    isHostProven = true;
                    socket.send(
                      JSON.stringify({ credential: connection.credential, type: HandshakeMessageType.Authenticate }),
                    );
                  },
                  () => {
                    socket.close();
                  },
                );
              else if (serverMessage.type === ServerMessageType.Authenticated && isHostProven) {
                isAdmitted = true;
                markConnected(connectionId);
              }
            }).match(noop, console.error);
          }),
        );
        socket.addEventListener("close", (event) => {
          // A socket this store already replaced — a re-pair — or a host stopped on purpose closing is not the
          // Connection going down
          if (
            connectionSocketMap.get(connectionId)?.webSocket !== socket ||
            getStatusRef(connectionId).value === ConnectionStatus.Stopped
          )
            return;
          // The host no longer knows this browser — its device was revoked — so the page forgets it
          if (event.code === HostCloseCode.CredentialRefused) {
            createAlert("A host no longer knows this browser. Connect to it again.", "error");
            unpair(connectionId);
            return;
          }

          if (connectionPairing && pairing.value === connectionPairing) {
            if (!connectionPairing.isOpenedByPage && event.code === HostCloseCode.PairingRefused)
              endPairing(connectionId, "This code was already used or has expired. Get a new one from the host.");
            else if (Date.now() > connectionPairing.deadline)
              endPairing(connectionId, "The host did not answer. Try connecting again.");
            // A host the page just opened may not be up yet, or not yet have the code, so it is asked again
            else
              connectionSocket.reconnectTimeoutId = window.setTimeout(() => {
                connectOne(connectionId);
              }, MIN_RECONNECT_DELAY_MS);
            return;
          }
          // A retry leaves the status alone, so a host that stays away reads as down rather than flickering back to
          // Connecting on every attempt
          getStatusRef(connectionId).value = ConnectionStatus.Disconnected;
          connectionSocket.reconnectTimeoutId = window.setTimeout(() => {
            connectOne(connectionId);
          }, connectionSocket.reconnectDelay);
          connectionSocket.reconnectDelay = Math.min(connectionSocket.reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
        });
      },
      // A saved host's address — one edited in local storage — is forgotten rather than handed to endPairing, which
      // Would cancel another host's pairing and reconnect to the same address, failing again without end
      (error) => {
        const message = `Not a host address: ${error.message}`;
        if (connectionPairing) {
          endPairing(connectionId, message);
          return;
        }

        createAlert(message, "error");
        unpair(connectionId);
      },
    );
  };
  // Every paired host, on load
  const connect = () => {
    for (const { id } of connections.value) connectOne(id);
  };
  // Asked for after a host was stopped: the attempt reads as connecting, and a host still not there reads as down and
  // Is retried like any other
  const reconnect = (connectionId: string) => {
    getStatusRef(connectionId).value = ConnectionStatus.Connecting;
    connectOne(connectionId);
  };
  // A host already paired at the same address is paired again in place, keeping its sessions where they were
  const beginPairing = (address: string, code: string, isOpenedByPage: boolean) => {
    const connectionId =
      connections.value.find((connection) => connection.address === address)?.id ?? crypto.randomUUID();
    disconnectOne(connectionId);
    linkedHost.value = { address: "", code: "" };
    pairing.value = {
      address,
      code,
      connectionId,
      deadline: Date.now() + SCHEME_PAIRING_CODE_DURATION_MS,
      isOpenedByPage,
    };
    getStatusRef(connectionId).value = ConnectionStatus.Connecting;
    connectOne(connectionId);
  };
  // One button connects this computer: the page makes a one-time code and opens the host with it through the link
  // Scheme, after the browser asks the reader, then presents the same code to the host it started
  const connectThisComputer = () => {
    const code = crypto.getRandomValues(new Uint8Array(PAIRING_CODE_BYTE_LENGTH)).toBase64({ alphabet: "base64url" });
    beginPairing(LOCAL_HOST_ADDRESS, code, true);
    window.location.assign(`${HOST_SCHEME}://pair?${new URLSearchParams({ [PAIRING_CODE_PARAMETER]: code })}`);
  };
  // A host elsewhere: the address and the one-time code it printed, from its link or typed into the sessions tab
  const pairLinkedHost = (address: string, code: string) => {
    beginPairing(address, code, false);
  };
  // This computer's host, stopped or not answering, started again through the link scheme with no code
  const startHost = (connectionId: string) => {
    window.location.assign(`${HOST_SCHEME}://start`);
    reconnect(connectionId);
  };
  // The host a session is on: the one the sessions list names, or a side chat's, which the list leaves out
  const getSessionConnectionId = (sessionId: string) =>
    agentConsoleSessionStore.sessions.find(({ id }) => id === sessionId)?.connectionId ??
    (sessionId && sessionId === agentConsoleSideChatStore.sideChatSessionId
      ? agentConsoleSideChatStore.sideChatConnectionId
      : undefined);
  // The host closes the socket of a message over its limit, so a command over it is not sent, and the reader is told why
  const checkIsSendable = (command: DistributedOmit<Command, "id">) => {
    if (!checkIsCommandTooLarge(command)) return true;

    createAlert(
      `The message is over ${getFileSize(MESSAGE_MAX_BYTE_LENGTH)}, the most the host takes at once — it was not sent`,
      "error",
    );
    return false;
  };
  // A command about a session or a shell goes to the host holding it; one that opens a session goes where the reader
  // Chose, or to the first host reached. Returns whether the command was sent
  const sendCommand = (
    command: DistributedOmit<Command, "id">,
    connectionId?: string,
    commandId = crypto.randomUUID(),
  ) => {
    const targetConnectionId =
      connectionId ??
      ("sessionId" in command ? getSessionConnectionId(command.sessionId) : undefined) ??
      ("shellId" in command
        ? agentConsoleShellStore.shells.find(({ id }) => id === command.shellId)?.connectionId
        : undefined) ??
      connectedConnections.value.at(0)?.id ??
      "";
    const webSocket = connectionSocketMap.get(targetConnectionId)?.webSocket;
    if (
      webSocket?.readyState !== WebSocket.OPEN ||
      getStatusRef(targetConnectionId).value !== ConnectionStatus.Connected
    ) {
      createAlert("Not connected to the host — the command was not sent", "error");
      return false;
    }

    if (!checkIsSendable(command)) return false;

    if (command.type === CommandType.Fork && command.isSideChat)
      sideChatCommandIds.set(commandId, agentConsoleSideChatStore.pendingQuestion);
    else if (
      [
        CommandType.CreateSession,
        CommandType.Fork,
        CommandType.OpenShell,
        CommandType.Resume,
        CommandType.ResumeAt,
      ].includes(command.type)
    )
      openingCommandIds.add(commandId);
    webSocket.send(JSON.stringify({ ...command, id: commandId }));
    return true;
  };
  // The side chat's fork is open. It becomes the drawer's session when the drawer is open and has none, and the
  // Question held while it opened is asked of it first. Any other fork — one the drawer closed before it opened, or a
  // Second one — is closed on the host, since nothing shows it
  const storeSideChatOpened = (connectionId: string, sessionId: string) => {
    if (!agentConsoleSideChatStore.isSideChatOpen || agentConsoleSideChatStore.sideChatSessionId) {
      sendCommand({ sessionId, type: CommandType.CloseSession }, connectionId);
      return;
    }

    agentConsoleSideChatStore.sideChatSessionId = sessionId;
    agentConsoleSideChatStore.sideChatConnectionId = connectionId;
    const { pendingQuestion } = agentConsoleSideChatStore;
    if (!pendingQuestion) return;

    agentConsoleSideChatStore.pendingQuestion = undefined;
    sendCommand(toPromptCommand(sessionId, pendingQuestion.text, pendingQuestion.attachments));
  };
  // The side chat's first question forks the session at its latest message and is asked of the fork once it has opened;
  // Every question after that is asked of the fork, which holds the conversation it was forked from. Returns whether the
  // Question was taken, so a question refused — the fork still opening, or no host reached — is kept by the reader
  const askSideChat = (text: string, attachments: Attachment[]) => {
    if (agentConsoleSideChatStore.sideChatSessionId)
      return sendCommand(toPromptCommand(agentConsoleSideChatStore.sideChatSessionId, text, attachments));
    // The fork is still opening, and its question is the one asked when it has
    if (agentConsoleSideChatStore.pendingQuestion) return false;
    // The question is sent once the fork has opened, so one the host would refuse is refused now, while the reader still
    // Has it. The fork's own id is not known yet, so the question is measured under the console's session's
    if (!checkIsSendable(toPromptCommand(agentConsoleSessionStore.currentSessionId, text, attachments))) return false;

    agentConsoleSideChatStore.pendingQuestion = { attachments, text };
    const isForkSent = sendCommand({
      isSideChat: true,
      messageUuid: "",
      sessionId: agentConsoleSessionStore.currentSessionId,
      type: CommandType.Fork,
    });
    if (!isForkSent) agentConsoleSideChatStore.pendingQuestion = undefined;
    return isForkSent;
  };
  // Ask Claude's line goes to the session the reader picked, or starts a new one in its folder, and the line is held
  // Until that session opens. Returns whether the line was sent, so a line refused while no host is reached is kept
  const askAssistant = (line: AssistantLine, connectionId?: string) => {
    if (line.sessionId) return sendCommand(toPromptCommand(line.sessionId, line.text, []), connectionId);

    const commandId = crypto.randomUUID();
    assistantLineCommandIds.set(commandId, line.text);
    const isSessionSent = sendCommand({ cwd: line.cwd, type: CommandType.CreateSession }, connectionId, commandId);
    if (!isSessionSent) assistantLineCommandIds.delete(commandId);
    return isSessionSent;
  };
  // Closing the drawer closes its fork on the host and discards its answers, which were never in the main conversation.
  // A fork still opening is left to storeSideChatOpened, which closes it as it arrives
  const closeSideChat = () => {
    const { sideChatSessionId } = agentConsoleSideChatStore;
    if (sideChatSessionId) {
      sendCommand({ sessionId: sideChatSessionId, type: CommandType.CloseSession });
      agentConsoleSessionStore.deleteData(sideChatSessionId);
    }

    agentConsoleSideChatStore.isSideChatOpen = false;
    agentConsoleSideChatStore.sideChatSessionId = "";
    agentConsoleSideChatStore.sideChatConnectionId = "";
    agentConsoleSideChatStore.sideChatComposerText = "";
    agentConsoleSideChatStore.pendingQuestion = undefined;
  };

  return {
    askAssistant,
    askSideChat,
    closeSideChat,
    connect,
    connectedConnections,
    connections,
    connectionStatuses,
    connectThisComputer,
    disconnect,
    linkedHost,
    pairing,
    pairLinkedHost,
    reconnect,
    sendCommand,
    startHost,
    status,
    unpair,
  };
});
