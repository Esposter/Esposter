import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { AgentConsoleServer } from "#src/models/server/AgentConsoleServer";
import type { ServerMessage } from "#src/models/server/ServerMessage";

import { CommandType } from "#src/models/command/CommandType";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { serverMessageSchema } from "#src/models/server/ServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { DEFAULT_HOSTNAME, TOKEN_QUERY_PARAMETER } from "#src/services/constants";
import { createAgentConsoleServer } from "#src/services/server/createAgentConsoleServer";
import { once } from "node:events";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WebSocket } from "ws";

const waitForMessage = <T extends ServerMessageType>(webSocket: WebSocket, type: T) =>
  new Promise<Extract<ServerMessage, { type: T }>>((resolve) => {
    const listener = (data: Buffer) => {
      // oxlint-disable-next-line no-restricted-properties -- the server message schema validates the payload and coerces its dates
      const serverMessage = serverMessageSchema.parse(JSON.parse(data.toString()));
      if (serverMessage.type !== type) return;
      webSocket.off("message", listener);
      resolve(serverMessage as Extract<ServerMessage, { type: T }>);
    };
    webSocket.on("message", listener);
  });

describe(createAgentConsoleServer, () => {
  const token = "token";
  const commandId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const createdAt = new Date(0);
  const events: AgentEvent[] = [{ createdAt, id: " ", message: " ", type: AgentEventType.HostError }];
  let server: AgentConsoleServer;
  let callbacks: DriverCallbacks;
  const createSession = vi.fn<Driver["createSession"]>();
  const connect = (candidateToken: string) =>
    new WebSocket(`ws://${DEFAULT_HOSTNAME}:${server.port}/?${TOKEN_QUERY_PARAMETER}=${candidateToken}`);

  beforeEach(async () => {
    createSession.mockImplementation(() => {
      callbacks.onSessionOpen(sessionId);
      // The same events twice — a driver reporting one event by two paths — reach the page once
      callbacks.onEvents(sessionId, events);
      callbacks.onEvents(sessionId, events);
      return Promise.resolve(sessionId);
    });
    server = await createAgentConsoleServer({
      createDriver: (driverCallbacks) => {
        callbacks = driverCallbacks;
        return {
          close: () => Promise.resolve(),
          closeSession: vi.fn<Driver["closeSession"]>(),
          createSession,
          forkSession: vi.fn<Driver["forkSession"]>(),
          interrupt: vi.fn<Driver["interrupt"]>(),
          listSessions: () => Promise.resolve([]),
          prompt: vi.fn<Driver["prompt"]>(),
          resolvePermission: vi.fn<Driver["resolvePermission"]>(),
          resumeAt: vi.fn<Driver["resumeAt"]>(),
          resumeSession: vi.fn<Driver["resumeSession"]>(),
          rewindFiles: vi.fn<Driver["rewindFiles"]>(),
          runSlashCommand: vi.fn<Driver["runSlashCommand"]>(),
          setModel: vi.fn<Driver["setModel"]>(),
          setPermissionMode: vi.fn<Driver["setPermissionMode"]>(),
        };
      },
      hostname: DEFAULT_HOSTNAME,
      port: 0,
      token,
    });
  });

  afterEach(async () => {
    await server.close();
  });

  test("refuses a connection without the token", async () => {
    expect.hasAssertions();

    const [error] = await once(connect(" "), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 401]`);
  });

  test("answers the browser's private-network preflight", async () => {
    expect.hasAssertions();

    const response = await fetch(`http://${DEFAULT_HOSTNAME}:${server.port}/`, {
      headers: { "Access-Control-Request-Private-Network": "true" },
      method: "OPTIONS",
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Private-Network")).toBe("true");
  });

  test("opens a session for the page that asked and replays its log to a page that connects later", async () => {
    expect.hasAssertions();

    const webSocket = connect(token);
    const pendingEvents = waitForMessage(webSocket, ServerMessageType.Events);
    const pendingSessionOpened = waitForMessage(webSocket, ServerMessageType.SessionOpened);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ cwd: " ", id: commandId, type: CommandType.CreateSession }));
    const sessionOpened = await pendingSessionOpened;
    const liveEvents = await pendingEvents;
    const laterWebSocket = connect(token);
    const replayedEvents = await waitForMessage(laterWebSocket, ServerMessageType.Events);

    expect(sessionOpened).toStrictEqual({ commandId, sessionId, type: ServerMessageType.SessionOpened });
    expect(liveEvents).toStrictEqual({ events, sessionId, type: ServerMessageType.Events });
    expect(replayedEvents).toStrictEqual(liveEvents);
  });

  test("passes an ephemeral event to the pages connected now and keeps it from the log", async () => {
    expect.hasAssertions();

    const turnUsageEvents: AgentEvent[] = [{ createdAt, id: " ", outputTokens: 0, type: AgentEventType.TurnUsage }];
    const webSocket = connect(token);
    const pendingSessionOpened = waitForMessage(webSocket, ServerMessageType.SessionOpened);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ cwd: " ", id: commandId, type: CommandType.CreateSession }));
    await pendingSessionOpened;
    const pendingLiveEvents = waitForMessage(webSocket, ServerMessageType.Events);
    callbacks.onEvents(sessionId, turnUsageEvents);
    const liveEvents = await pendingLiveEvents;
    const replayedEvents = await waitForMessage(connect(token), ServerMessageType.Events);

    expect(liveEvents.events).toStrictEqual(turnUsageEvents);
    expect(replayedEvents.events).toStrictEqual(events);
  });

  test("answers a message that is not a command with why, under no command id", async () => {
    expect.hasAssertions();

    const webSocket = connect(token);
    const pendingCommandError = waitForMessage(webSocket, ServerMessageType.CommandError);
    await once(webSocket, "open");
    webSocket.send("{}");
    const commandError = await pendingCommandError;

    expect(commandError.commandId).toBe("");
  });
});
