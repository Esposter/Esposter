import type { AgentConsoleServer } from "#src/models/server/AgentConsoleServer";
import type { AgentConsoleServerOptions } from "#src/models/server/AgentConsoleServerOptions";
import type { ServerMessage } from "#src/models/server/ServerMessage";
import type { RawData, WebSocket } from "ws";

import { commandSchema } from "#src/models/command/Command";
import { CommandType } from "#src/models/command/CommandType";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { TOKEN_QUERY_PARAMETER } from "#src/services/constants";
import { answerHttpRequest } from "#src/services/server/answerHttpRequest";
import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";
import { createEventLog } from "#src/services/server/createEventLog";
import { handleCommand } from "#src/services/server/handleCommand";
import { sendServerMessage } from "#src/services/server/sendServerMessage";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { getResult, getResultAsync } from "@esposter/shared";
import { once } from "node:events";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
// The host: one WebSocket, gated by the token, speaking the contracts both ways. It keeps each open session's
// Event log so a page that connects — or reconnects — mid-session is replayed everything before the live stream.
export const createAgentConsoleServer = async ({
  createDriver,
  hostname,
  port,
  token,
}: AgentConsoleServerOptions): Promise<AgentConsoleServer> => {
  const eventLog = createEventLog();
  const taskRegistry = createTaskRegistry();
  const webSocketServer = new WebSocketServer({ noServer: true });
  const broadcast = (message: ServerMessage) => {
    for (const webSocket of webSocketServer.clients) sendServerMessage(webSocket, message);
  };
  // Many changes land together — a turn ending changes a state and a title — so a refresh asked for while one is
  // Running is folded into one more after it, never a second running beside it and never lost
  let isRefreshing = false;
  let isRefreshStale = false;
  const refreshSessions = () => {
    if (isRefreshing) {
      isRefreshStale = true;
      return;
    }

    isRefreshing = true;
    taskRegistry.run(async () => {
      do {
        isRefreshStale = false;
        // oxlint-disable-next-line no-await-in-loop -- Retry: the refresh repeats only because another was requested while it ran
        await getResultAsync(() => driver.listSessions()).match((sessions) => {
          broadcast({ sessions, type: ServerMessageType.Sessions });
        }, console.error);
      } while (isRefreshStale);
      isRefreshing = false;
    });
  };
  const driver = createDriver({
    onEvents: (sessionId, events) => {
      const newEvents = eventLog.append(sessionId, events);
      if (newEvents.length > 0) broadcast({ events: newEvents, sessionId, type: ServerMessageType.Events });
    },
    onSessionOpen: (sessionId) => {
      eventLog.reset(sessionId);
      broadcast({ sessionId, type: ServerMessageType.SessionReset });
    },
    onSessionsChange: () => {
      refreshSessions();
    },
  });

  // A message that is not a command is answered with why, under no command id — the page cannot have sent it
  const receive = async (webSocket: WebSocket, data: RawData) => {
    const text = Buffer.isBuffer(data)
      ? data.toString()
      : Array.isArray(data)
        ? Buffer.concat(data).toString()
        : Buffer.from(data).toString();
    const command = getResult(
      // oxlint-disable-next-line no-restricted-properties -- the command schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
      () => commandSchema.parse(JSON.parse(text)),
    )
      .orTee((error) => {
        sendServerMessage(webSocket, { commandId: "", message: error.message, type: ServerMessageType.CommandError });
      })
      .unwrapOr(undefined);
    if (!command) return;

    await getResultAsync(() => handleCommand(driver, command)).match(
      (sessionId) => {
        if (sessionId)
          sendServerMessage(webSocket, { commandId: command.id, sessionId, type: ServerMessageType.SessionOpened });
        else if (command.type === CommandType.ListSessions) refreshSessions();
      },
      (error) => {
        sendServerMessage(webSocket, {
          commandId: command.id,
          message: error.message,
          type: ServerMessageType.CommandError,
        });
      },
    );
  };

  webSocketServer.on("connection", (webSocket) => {
    for (const [sessionId, events] of eventLog.entries())
      sendServerMessage(webSocket, { events, sessionId, type: ServerMessageType.Events });
    refreshSessions();
    webSocket.on("message", (data) => {
      taskRegistry.run(() => receive(webSocket, data));
    });
  });

  const httpServer = createServer((request, response) => {
    answerHttpRequest(request, response);
  });
  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (!checkIsTokenValid(url.searchParams.get(TOKEN_QUERY_PARAMETER) ?? "", token)) {
      socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return;
    }

    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      webSocketServer.emit("connection", webSocket, request);
    });
  });
  httpServer.listen(port, hostname);
  await once(httpServer, "listening");
  const address = httpServer.address();

  return {
    close: async () => {
      await driver.close();
      for (const webSocket of webSocketServer.clients) webSocket.terminate();
      webSocketServer.close();
      httpServer.close();
      await Promise.all([taskRegistry.drain(), once(webSocketServer, "close"), once(httpServer, "close")]);
    },
    port: typeof address === "object" && address ? address.port : port,
  };
};
