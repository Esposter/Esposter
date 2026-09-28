import type { Connection } from "@/models/agentConsole/Connection";
import type { ConnectionSocket } from "@/models/agentConsole/ConnectionSocket";
import type { Pairing } from "@/models/agentConsole/Pairing";
import type { Command, ServerMessage } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { checkIsHostProofValid } from "@/services/agentConsole/checkIsHostProofValid";
import {
  LOCAL_HOST_ADDRESS,
  MAX_RECONNECT_DELAY_MS,
  MIN_RECONNECT_DELAY_MS,
  PAIRING_CODE_BYTE_LENGTH,
} from "@/services/agentConsole/constants";
import { getPort } from "@/services/agentConsole/getPort";
import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";
import { reactToEvents } from "@/services/agentConsole/reactToEvents";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAlertStore } from "@/store/alert";
import { exhaustiveGuard, getOrCreate, getResult, getResultAsync, noop } from "@esposter/shared";
import {
  CommandType,
  HandshakeMessageType,
  HOST_SCHEME,
  HostCloseCode,
  PAIRING_CODE_PARAMETER,
  SCHEME_PAIRING_CODE_DURATION,
  serverMessageSchema,
  ServerMessageType,
  SessionState,
} from "agent-console-server/contracts";

// The order a set of connections reads as one status in: any host reached makes the page usable
const AggregateStatusOrder = [
  ConnectionStatus.Connected,
  ConnectionStatus.Connecting,
  ConnectionStatus.Disconnected,
  ConnectionStatus.Stopped,
] as const;

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
  const connections = useLocalStorage<Connection[]>(LocalStorageKey.AgentConsoleConnections, []);
  const { getDataRef: getStatusRef } = useDataMap("", ConnectionStatus.Connecting);
  const pairing = shallowRef<Pairing>();
  // A host a pairing link named, shown to the reader rather than paired with: a link is anyone's to craft, and one
  // That paired on its own would send everything typed into the console to whichever host its author runs
  const linkedHost = ref({ address: "", code: "" });
  const theme = AgentConsoleThemeMap[AgentConsoleThemeType.Default];
  // The commands this tab sent that open a session: the session they open is the one this tab moves to
  const openingCommandIds = new Set<string>();
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
    return AggregateStatusOrder.find((aggregateStatus) => statuses.has(aggregateStatus)) ?? ConnectionStatus.Unpaired;
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
      case ServerMessageType.CommandError:
        openingCommandIds.delete(serverMessage.commandId);
        // oxlint-disable-next-line error-alert/no-raw-error-alert -- a host's command error is not a tRPC rejection, so no error link has shown it
        createAlert(serverMessage.message, "error");
        break;
      case ServerMessageType.Events: {
        const addedEvents = storeEvents(serverMessage.sessionId, serverMessage.events);
        const sessionTitle =
          agentConsoleSessionStore.sessions.find(({ id }) => id === serverMessage.sessionId)?.title ?? "";
        reactToEvents(theme, sessionTitle, addedEvents, getConnectionSocket(connectionId).connectedAt);
        break;
      }
      // The host was stopped from its own window, so its sessions end with it and the page waits to be asked to
      // Reconnect rather than retrying a host that is not coming back on its own
      case ServerMessageType.HostStopping:
        getStatusRef(connectionId).value = ConnectionStatus.Stopped;
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
        if (openingCommandIds.delete(serverMessage.commandId))
          agentConsoleSessionStore.currentSessionId = serverMessage.sessionId;
        break;
      case ServerMessageType.SessionReset:
        storeSessionReset(serverMessage.sessionId);
        break;
      case ServerMessageType.Sessions:
        storeSessions(connectionId, serverMessage.sessions);
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
    connections.value = connections.value.filter(({ id }) => !removedConnectionIds.includes(id));
    if (!agentConsoleSessionStore.sessions.some(({ id }) => id === agentConsoleSessionStore.currentSessionId))
      agentConsoleSessionStore.currentSessionId = "";
    if (connections.value.length > 0) return;
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
        // Until the host has signed the challenge nothing is sent to it, and until it has admitted the page, or paired
        // It, nothing it sends is taken
        let isHostProven = false;
        let isAdmitted = false;
        socket.addEventListener("open", () => {
          socket.send(
            JSON.stringify(
              connectionPairing
                ? { code: connectionPairing.code, type: HandshakeMessageType.Pair }
                : { nonce, type: HandshakeMessageType.Challenge },
            ),
          );
        });
        // oxlint-disable-next-line typescript/no-misused-promises, typescript/strict-void-return -- a socket ignores what its listener returns, and the listener logs its own failure
        socket.addEventListener("message", async (event) => {
          await getResultAsync(async () => {
            // oxlint-disable-next-line no-restricted-properties -- the server message schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
            const serverMessage = serverMessageSchema.parse(JSON.parse(String(event.data)));
            if (isAdmitted) {
              receive(connectionId, serverMessage);
              return;
            }

            if (serverMessage.type === ServerMessageType.Paired && connectionPairing) {
              const { credential, deviceId, publicKey } = serverMessage;
              const pairedConnection: Connection = { address, credential, deviceId, id: connectionId, publicKey };
              connections.value = connection
                ? connections.value.map((oldConnection) =>
                    oldConnection.id === connectionId ? pairedConnection : oldConnection,
                  )
                : [...connections.value, pairedConnection];
              pairing.value = undefined;
              isAdmitted = true;
              markConnected(connectionId);
            } else if (serverMessage.type === ServerMessageType.Proof && connection)
              await getResultAsync(() =>
                checkIsHostProofValid(connection.publicKey, serverMessage.port, nonce, serverMessage.signature),
              ).match(
                (isValid) => {
                  // On this computer another program can hold a port beside the host's and relay the challenge to
                  // It, so the port the host signed must be the one the page reached. A remote host is reached
                  // Through its own certificate, often on a port its proxy forwards from, so its signature alone
                  // Proves it
                  if (!isValid || (!getRemoteHostname(address) && serverMessage.port !== getPort(address))) {
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
        });
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
      (error) => {
        endPairing(connectionId, `Not a host address: ${error.message}`);
      },
    );
  };

  // Every paired host, on load
  const connect = () => {
    for (const { id } of connections.value) connectOne(id);
  };

  // Asked for after a host was stopped: the attempt reads as connecting, and a host still not there reads as down and is
  // Retried like any other
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
      deadline: Date.now() + SCHEME_PAIRING_CODE_DURATION,
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

  // A command about a session goes to the host holding it; one that opens a session goes where the reader chose, or
  // To the first host reached
  const sendCommand = (command: DistributedOmit<Command, "id">, connectionId?: string) => {
    const targetConnectionId =
      connectionId ??
      ("sessionId" in command
        ? agentConsoleSessionStore.sessions.find(({ id }) => id === command.sessionId)?.connectionId
        : undefined) ??
      connectedConnections.value.at(0)?.id ??
      "";
    const webSocket = connectionSocketMap.get(targetConnectionId)?.webSocket;
    if (
      webSocket?.readyState !== WebSocket.OPEN ||
      getStatusRef(targetConnectionId).value !== ConnectionStatus.Connected
    ) {
      createAlert("Not connected to the host — the command was not sent", "error");
      return;
    }

    const id = crypto.randomUUID();
    if ([CommandType.CreateSession, CommandType.Fork, CommandType.Resume, CommandType.ResumeAt].includes(command.type))
      openingCommandIds.add(id);
    webSocket.send(JSON.stringify({ ...command, id }));
  };

  return {
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
