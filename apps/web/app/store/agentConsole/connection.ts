import type { PairedHost } from "@/models/agentConsole/PairedHost";
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
import { exhaustiveGuard, getResult, getResultAsync, noop } from "@esposter/shared";
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

const createUnpairedHost = (): PairedHost => ({ address: "", credential: "", deviceId: "", publicKey: "" });

// The one socket to the paired host. Every connect proves the host first: the page sends a fresh challenge and sends
// Its credential only once the host has signed it with the key the page was given when it paired, so a program
// Squatting on the port learns nothing. A host that goes away without a word is retried with a backoff capped at a
// Constant, so starting it again is all it takes for the page to come back, with every open session's log replayed
// On reconnect. A host that says it is stopping was stopped on purpose, and is reconnected to only when asked
export const useAgentConsoleConnectionStore = defineStore("agentConsole/connection", () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  const { storeEvents, storeSessionReset, storeSessions } = agentConsoleSessionStore;
  const pairedHost = useLocalStorage(LocalStorageKey.AgentConsolePairedHost, createUnpairedHost());
  const status = ref(pairedHost.value.credential ? ConnectionStatus.Connecting : ConnectionStatus.Unpaired);
  // This computer's host is the one a page can start, through the link scheme
  const isLocalHost = computed(() => pairedHost.value.address === LOCAL_HOST_ADDRESS);
  // A host a pairing link named, shown to the reader rather than paired with: a link is anyone's to craft, and one
  // That paired on its own would send everything typed into the console to whichever host its author runs
  const linkedHost = ref({ address: "", code: "" });
  const theme = AgentConsoleThemeMap[AgentConsoleThemeType.Default];
  // The commands this tab sent that open a session: the session they open is the one this tab moves to
  const openingCommandIds = new Set<string>();
  let pairing: Pairing | undefined;
  let webSocket: undefined | WebSocket;
  let connectedAt = new Date();
  let reconnectDelay = MIN_RECONNECT_DELAY_MS;
  let reconnectTimeoutId = 0;

  const receive = (serverMessage: ServerMessage) => {
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
        reactToEvents(theme, sessionTitle, addedEvents, connectedAt);
        break;
      }
      // The host was stopped from its own window, so its sessions end with it and the page waits to be asked to
      // Reconnect rather than retrying a host that is not coming back on its own
      case ServerMessageType.HostStopping:
        status.value = ConnectionStatus.Stopped;
        storeSessions(agentConsoleSessionStore.sessions.map((session) => ({ ...session, state: SessionState.Closed })));
        break;
      case ServerMessageType.SessionOpened:
        if (openingCommandIds.delete(serverMessage.commandId))
          agentConsoleSessionStore.currentSessionId = serverMessage.sessionId;
        break;
      case ServerMessageType.SessionReset:
        storeSessionReset(serverMessage.sessionId);
        break;
      case ServerMessageType.Sessions:
        storeSessions(serverMessage.sessions);
        break;
      default:
        exhaustiveGuard(serverMessage);
    }
  };

  const markConnected = () => {
    connectedAt = new Date();
    reconnectDelay = MIN_RECONNECT_DELAY_MS;
    status.value = ConnectionStatus.Connected;
  };

  const disconnect = () => {
    window.clearTimeout(reconnectTimeoutId);
    const socket = webSocket;
    webSocket = undefined;
    socket?.close();
  };

  // What the page shows of a host leaves with it, so the title screen asking for the next one has nothing behind it
  const unpair = () => {
    disconnect();
    pairing = undefined;
    pairedHost.value = createUnpairedHost();
    status.value = ConnectionStatus.Unpaired;
    storeSessions([]);
    agentConsoleSessionStore.currentSessionId = "";
    agentConsolePanelStore.isConsoleOpen = false;
    agentConsolePanelStore.isPauseMenuOpen = false;
  };

  // A pairing that can no longer succeed leaves the page as it was before it: on the host it was paired with, if any
  const endPairing = (message: string) => {
    pairing = undefined;
    createAlert(message, "error");
    if (pairedHost.value.credential) connect();
    else status.value = ConnectionStatus.Unpaired;
  };

  const connect = () => {
    window.clearTimeout(reconnectTimeoutId);
    const address = pairing?.address ?? pairedHost.value.address;
    if (!pairing && !pairedHost.value.credential) {
      status.value = ConnectionStatus.Unpaired;
      return;
    }
    // An address that is not a WebSocket URL throws here rather than failing to connect. Retrying it could never
    // Succeed, so it is refused
    getResult(() => new WebSocket(address)).match(
      (socket) => {
        webSocket = socket;
        const nonce = crypto.randomUUID();
        // Until the host has signed the challenge nothing is sent to it, and until it has admitted the page, or paired
        // It, nothing it sends is taken
        let isHostProven = false;
        let isAdmitted = false;
        socket.addEventListener("open", () => {
          socket.send(
            JSON.stringify(
              pairing
                ? { code: pairing.code, type: HandshakeMessageType.Pair }
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
              receive(serverMessage);
              return;
            }

            if (serverMessage.type === ServerMessageType.Paired && pairing) {
              const { credential, deviceId, publicKey } = serverMessage;
              pairedHost.value = { address: pairing.address, credential, deviceId, publicKey };
              pairing = undefined;
              isAdmitted = true;
              markConnected();
            } else if (serverMessage.type === ServerMessageType.Proof)
              await getResultAsync(() =>
                checkIsHostProofValid(pairedHost.value.publicKey, serverMessage.port, nonce, serverMessage.signature),
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
                    JSON.stringify({
                      credential: pairedHost.value.credential,
                      type: HandshakeMessageType.Authenticate,
                    }),
                  );
                },
                () => {
                  socket.close();
                },
              );
            else if (serverMessage.type === ServerMessageType.Authenticated && isHostProven) {
              isAdmitted = true;
              markConnected();
            }
          }).match(noop, console.error);
        });
        socket.addEventListener("close", (event) => {
          // A socket this store already replaced — a re-pair — closing late is not the connection going down
          if (webSocket !== socket || status.value === ConnectionStatus.Stopped) return;
          // The host no longer knows this browser — its device was revoked — so the page forgets it
          if (event.code === HostCloseCode.CredentialRefused) {
            createAlert("This computer's host no longer knows this browser. Connect again.", "error");
            unpair();
            return;
          }

          if (pairing) {
            if (!pairing.isOpenedByPage && event.code === HostCloseCode.PairingRefused)
              endPairing("This link was already used or has expired. Open a new one from the host's window.");
            else if (Date.now() > pairing.deadline) endPairing("The host did not answer. Press Connect to try again.");
            // A host the page just opened may not be up yet, or not yet have the code, so it is asked again
            else
              reconnectTimeoutId = window.setTimeout(() => {
                connect();
              }, MIN_RECONNECT_DELAY_MS);
            return;
          }
          // A retry leaves the status alone, so a host that stays away reads as down rather than flickering back to
          // Connecting on every attempt
          status.value = ConnectionStatus.Disconnected;
          reconnectTimeoutId = window.setTimeout(() => {
            connect();
          }, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
        });
      },
      (error) => {
        endPairing(`Not a host address: ${error.message}`);
      },
    );
  };

  // Asked for after a host was stopped: the attempt reads as connecting, and a host still not there reads as down and is
  // Retried like any other
  const reconnect = () => {
    status.value = ConnectionStatus.Connecting;
    connect();
  };

  const beginPairing = (newPairing: Pairing) => {
    disconnect();
    linkedHost.value = { address: "", code: "" };
    pairing = newPairing;
    status.value = ConnectionStatus.Connecting;
    connect();
  };

  // One button connects this computer: the page makes a one-time code and opens the host with it through the link
  // Scheme, after the browser asks the reader, then presents the same code to the host it started
  const connectThisComputer = () => {
    const code = crypto.getRandomValues(new Uint8Array(PAIRING_CODE_BYTE_LENGTH)).toBase64({ alphabet: "base64url" });
    beginPairing({
      address: LOCAL_HOST_ADDRESS,
      code,
      deadline: Date.now() + SCHEME_PAIRING_CODE_DURATION,
      isOpenedByPage: true,
    });
    window.location.assign(`${HOST_SCHEME}://pair?${new URLSearchParams({ [PAIRING_CODE_PARAMETER]: code })}`);
  };

  // The reader's Connect on a link the host printed, carrying its own one-time code
  const pairLinkedHost = (address: string, code: string) => {
    beginPairing({ address, code, deadline: Date.now() + SCHEME_PAIRING_CODE_DURATION, isOpenedByPage: false });
  };

  // This computer's host, stopped or not answering, started again through the link scheme with no code
  const startHost = () => {
    window.location.assign(`${HOST_SCHEME}://start`);
    reconnect();
  };

  const sendCommand = (command: DistributedOmit<Command, "id">) => {
    if (webSocket?.readyState !== WebSocket.OPEN || status.value !== ConnectionStatus.Connected) {
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
    connectThisComputer,
    disconnect,
    isLocalHost,
    linkedHost,
    pairedHost,
    pairLinkedHost,
    reconnect,
    sendCommand,
    startHost,
    status,
    unpair,
  };
});
