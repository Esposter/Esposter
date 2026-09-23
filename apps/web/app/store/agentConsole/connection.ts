import type { Command, ServerMessage } from "agent-console-server/contracts";
import type { DistributedOmit } from "type-fest";

import { AgentConsoleThemeType } from "@/models/agentConsole/AgentConsoleThemeType";
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { MAX_RECONNECT_DELAY_MS, MIN_RECONNECT_DELAY_MS } from "@/services/agentConsole/constants";
import { reactToEvents } from "@/services/agentConsole/reactToEvents";
import { AgentConsoleThemeMap } from "@/services/agentConsole/themes/AgentConsoleThemeMap";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAlertStore } from "@/store/alert";
import { exhaustiveGuard, getResult } from "@esposter/shared";
import { CommandType, serverMessageSchema, ServerMessageType } from "agent-console-server/contracts";
// The one socket to the paired host. It never gives up: a host that goes away is retried with a backoff capped at a
// Constant, so starting the host again is all it takes for the page to come back, with every open session's log
// Replayed from the host on reconnect
export const useAgentConsoleConnectionStore = defineStore("agentConsole/connection", () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  const { storeEvents, storeSessionReset, storeSessions } = agentConsoleSessionStore;
  const hostUrl = useLocalStorage(LocalStorageKey.AgentConsoleHostUrl, "");
  const status = ref(hostUrl.value ? ConnectionStatus.Disconnected : ConnectionStatus.Unpaired);
  const theme = AgentConsoleThemeMap[AgentConsoleThemeType.Default];
  // The commands this tab sent that open a session: the session they open is the one this tab moves to
  const openingCommandIds = new Set<string>();
  let webSocket: undefined | WebSocket;
  let connectedAt = new Date();
  let reconnectDelay = MIN_RECONNECT_DELAY_MS;
  let reconnectTimeoutId = 0;

  const receive = (serverMessage: ServerMessage) => {
    switch (serverMessage.type) {
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

  const connect = () => {
    window.clearTimeout(reconnectTimeoutId);
    if (!hostUrl.value) {
      status.value = ConnectionStatus.Unpaired;
      return;
    }

    // A pasted address that is not a WebSocket URL throws here rather than failing to connect. Retrying it could
    // Never succeed, so it is refused and the page goes back to asking for one
    getResult(() => new WebSocket(hostUrl.value)).match(
      (socket) => {
        status.value = ConnectionStatus.Connecting;
        webSocket = socket;
        socket.addEventListener("open", () => {
          connectedAt = new Date();
          reconnectDelay = MIN_RECONNECT_DELAY_MS;
          status.value = ConnectionStatus.Connected;
        });
        socket.addEventListener("message", ({ data }) => {
          getResult(() =>
            // oxlint-disable-next-line no-restricted-properties -- the server message schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
            serverMessageSchema.parse(JSON.parse(String(data))),
          ).match((serverMessage) => {
            receive(serverMessage);
          }, console.error);
        });
        socket.addEventListener("close", () => {
          // A socket this store already replaced — a re-pair — closing late is not the connection going down
          if (webSocket !== socket) return;
          status.value = ConnectionStatus.Disconnected;
          reconnectTimeoutId = window.setTimeout(() => {
            connect();
          }, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
        });
      },
      (error) => {
        createAlert(`Not a host URL: ${error.message}`, "error");
        hostUrl.value = "";
        status.value = ConnectionStatus.Unpaired;
      },
    );
  };

  const disconnect = () => {
    window.clearTimeout(reconnectTimeoutId);
    const socket = webSocket;
    webSocket = undefined;
    socket?.close();
  };

  const pair = (newHostUrl: string) => {
    disconnect();
    hostUrl.value = newHostUrl;
    connect();
  };

  const unpair = () => {
    disconnect();
    hostUrl.value = "";
    status.value = ConnectionStatus.Unpaired;
  };

  const sendCommand = (command: DistributedOmit<Command, "id">) => {
    if (webSocket?.readyState !== WebSocket.OPEN) {
      createAlert("Not connected to the host — the command was not sent", "error");
      return;
    }

    const id = crypto.randomUUID();
    if ([CommandType.CreateSession, CommandType.Fork, CommandType.Resume, CommandType.ResumeAt].includes(command.type))
      openingCommandIds.add(id);
    webSocket.send(JSON.stringify({ ...command, id }));
  };

  return { connect, disconnect, hostUrl, pair, sendCommand, status, unpair };
});
