import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { AgentConsoleServer } from "#src/models/server/AgentConsoleServer";
import type { ServerMessage } from "#src/models/server/ServerMessage";
import type { ShellTerminal } from "#src/models/shell/ShellTerminal";

import { CommandType } from "#src/models/command/CommandType";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import { HostCloseCode } from "#src/models/server/HostCloseCode";
import { serverMessageSchema } from "#src/models/server/ServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { SessionState } from "#src/models/session/SessionState";
import { DEFAULT_APP_ORIGIN, DEFAULT_HOSTNAME, SCHEME_PAIRING_CODE_DURATION } from "#src/services/constants";
import { readDevices } from "#src/services/device/readDevices";
import { checkIsSignatureValid } from "#src/services/handshake/checkIsSignatureValid";
import { createAgentConsoleServer } from "#src/services/server/createAgentConsoleServer";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";
import { noop } from "@esposter/shared";
import { createPublicKey, generateKeyPairSync } from "node:crypto";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest";
import { createWebSocketStream, WebSocket, WebSocketServer } from "ws";

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

// A shell that prints what the test hands it and ends when killed, as a pseudo-terminal's shell does
const createFakeTerminal = () => {
  const dataListeners: ((data: string) => void)[] = [];
  const exitListeners: (() => void)[] = [];
  const terminal: ShellTerminal = {
    kill: vi.fn<ShellTerminal["kill"]>(() => {
      for (const exitListener of exitListeners) exitListener();
    }),
    onData: (listener) => dataListeners.push(listener),
    onExit: (listener) => exitListeners.push(listener),
    resize: vi.fn<ShellTerminal["resize"]>(),
    write: vi.fn<ShellTerminal["write"]>(),
  };
  const print = (data: string) => {
    for (const dataListener of dataListeners) dataListener(data);
  };
  return { print, terminal };
};

describe(createAgentConsoleServer, () => {
  const { privateKey: hostKey } = generateKeyPairSync("ed25519");
  const code = crypto.randomUUID();
  const commandId = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const createdAt = new Date(0);
  const events: AgentEvent[] = [{ createdAt, id: " ", message: " ", type: AgentEventType.HostError }];
  let server: AgentConsoleServer;
  let callbacks: DriverCallbacks;
  let stateDirectory: string;
  const createSession = vi.fn<Driver["createSession"]>();
  let fakeTerminal: ReturnType<typeof createFakeTerminal>;
  const connect = (origin: string = DEFAULT_APP_ORIGIN) =>
    new WebSocket(`ws://${DEFAULT_HOSTNAME}:${server.port}`, { origin });
  // A page pairing with a code the host holds, resolved once it is admitted
  const pair = async () => {
    const webSocket = connect();
    server.addPairingCode(code, SCHEME_PAIRING_CODE_DURATION);
    const pendingPaired = waitForMessage(webSocket, ServerMessageType.Paired);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ code, type: HandshakeMessageType.Pair }));
    return { paired: await pendingPaired, webSocket };
  };
  const authenticate = async (credential: string) => {
    const webSocket = connect();
    const pendingAuthenticated = waitForMessage(webSocket, ServerMessageType.Authenticated);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ credential, type: HandshakeMessageType.Authenticate }));
    await pendingAuthenticated;
    return webSocket;
  };

  beforeEach(async () => {
    stateDirectory = mkdtempSync(join(tmpdir(), "agent-console-server-"));
    fakeTerminal = createFakeTerminal();
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
      hostKey,
      hostname: DEFAULT_HOSTNAME,
      origin: DEFAULT_APP_ORIGIN,
      port: 0,
      spawnShell: () => Promise.resolve(fakeTerminal.terminal),
      stateDirectory,
      writeLine: noop,
    });
  });

  afterEach(async () => {
    await server.close();
    rmSync(stateDirectory, { force: true, recursive: true });
  });

  test("refuses a socket from a page on another site", async () => {
    expect.hasAssertions();

    const [error] = await once(connect("https://a"), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 403]`);
  });

  test("signs a challenge with its key, so a page tells it from another program on the port", async () => {
    expect.hasAssertions();

    const nonce = crypto.randomUUID();
    const webSocket = connect();
    const pendingProof = waitForMessage(webSocket, ServerMessageType.Proof);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ nonce, type: HandshakeMessageType.Challenge }));
    const { port, signature } = await pendingProof;

    expect(port).toBe(server.port);
    expect(checkIsSignatureValid(createPublicKey(hostKey), SignaturePurpose.HostProof, port, nonce, signature)).toBe(
      true,
    );
  });

  test("pairs a page once per code, keeping only its credential's hash", async () => {
    expect.hasAssertions();

    const { paired } = await pair();
    const secondWebSocket = connect();
    await once(secondWebSocket, "open");
    secondWebSocket.send(JSON.stringify({ code, type: HandshakeMessageType.Pair }));
    const [closeCode] = await once(secondWebSocket, "close");
    const [device] = readDevices(stateDirectory);

    expect(closeCode).toBe(HostCloseCode.PairingRefused);
    expect(device?.id).toBe(paired.deviceId);
    expect(device?.credentialHash).not.toBe(paired.credential);
  });

  test("refuses a pairing that carries no browser's origin", async () => {
    expect.hasAssertions();

    server.addPairingCode(code, SCHEME_PAIRING_CODE_DURATION);
    const webSocket = new WebSocket(`ws://${DEFAULT_HOSTNAME}:${server.port}`);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ code, type: HandshakeMessageType.Pair }));
    const [closeCode] = await once(webSocket, "close");

    expect(closeCode).toBe(HostCloseCode.PairingRefused);
  });

  test("admits a paired page's credential on a later connect, and refuses one it does not know", async () => {
    expect.hasAssertions();

    const { paired } = await pair();
    const webSocket = await authenticate(paired.credential);
    const unknownWebSocket = connect();
    await once(unknownWebSocket, "open");
    unknownWebSocket.send(JSON.stringify({ credential: code, type: HandshakeMessageType.Authenticate }));
    const [closeCode] = await once(unknownWebSocket, "close");

    expect(webSocket.readyState).toBe(WebSocket.OPEN);
    expect(closeCode).toBe(HostCloseCode.CredentialRefused);
  });

  test("closes a revoked device's socket at once", async () => {
    expect.hasAssertions();

    const { paired, webSocket } = await pair();
    const pendingClose = once(webSocket, "close");
    const isHost = await sendToRunningHost(DEFAULT_HOSTNAME, server.port, hostKey, (signature) => ({
      deviceId: paired.deviceId,
      signature,
      type: HandshakeMessageType.Revoke,
    }));
    const [closeCode] = await pendingClose;

    expect(isHost).toBe(true);
    expect(closeCode).toBe(HostCloseCode.CredentialRefused);
  });

  // A pairing that read the list before the executable wrote it without the device writes the device back
  test("removes a revoked device a pairing wrote back to the list", async () => {
    expect.hasAssertions();

    const { paired } = await pair();
    await sendToRunningHost(DEFAULT_HOSTNAME, server.port, hostKey, (signature) => ({
      deviceId: paired.deviceId,
      signature,
      type: HandshakeMessageType.Revoke,
    }));

    expect(readDevices(stateDirectory)).toStrictEqual([]);
  });

  // A program on another port that relays every frame to the host: the host signs the port it answers on, which is
  // Not the one the second start reached, so the relay is never taken for the host
  test("does not take a program relaying to the host from another port for the host", async () => {
    expect.hasAssertions();

    const relayServer = new WebSocketServer({ host: DEFAULT_HOSTNAME, port: 0 });
    await once(relayServer, "listening");
    relayServer.on("connection", (relayedWebSocket) => {
      const relayedStream = createWebSocketStream(relayedWebSocket);
      relayedStream
        .pipe(createWebSocketStream(new WebSocket(`ws://${DEFAULT_HOSTNAME}:${server.port}`)))
        .pipe(relayedStream);
    });
    const address = relayServer.address();
    const relayPort = typeof address === "object" && address ? address.port : 0;
    onTestFinished(() => {
      for (const webSocket of relayServer.clients) webSocket.terminate();
      relayServer.close();
    });

    await expect(sendToRunningHost(DEFAULT_HOSTNAME, relayPort, hostKey)).resolves.toBe(false);
  });

  test("takes a code handed off by its own executable", async () => {
    expect.hasAssertions();

    const handedOffCode = crypto.randomUUID();
    await sendToRunningHost(DEFAULT_HOSTNAME, server.port, hostKey, (signature) => ({
      code: handedOffCode,
      signature,
      type: HandshakeMessageType.HandOff,
    }));
    const webSocket = connect();
    const pendingPaired = waitForMessage(webSocket, ServerMessageType.Paired);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ code: handedOffCode, type: HandshakeMessageType.Pair }));

    const { deviceId } = await pendingPaired;

    expect(readDevices(stateDirectory).map(({ id }) => id)).toStrictEqual([deviceId]);
  });

  // One key signs both proofs, so a page's challenge could have the host sign another connection's nonce: the purpose
  // Signed with it keeps that signature from passing as the executable's own
  test("refuses a hand-off signed by the host's answer to another connection's challenge", async () => {
    expect.hasAssertions();

    const webSocket = connect();
    const pendingProof = waitForMessage(webSocket, ServerMessageType.Proof);
    await once(webSocket, "open");
    webSocket.send(JSON.stringify({ nonce: crypto.randomUUID(), type: HandshakeMessageType.Challenge }));
    const { nonce: hostNonce } = await pendingProof;
    const otherWebSocket = connect();
    const pendingOtherProof = waitForMessage(otherWebSocket, ServerMessageType.Proof);
    await once(otherWebSocket, "open");
    otherWebSocket.send(JSON.stringify({ nonce: hostNonce, type: HandshakeMessageType.Challenge }));
    const { signature } = await pendingOtherProof;
    webSocket.send(JSON.stringify({ code, signature, type: HandshakeMessageType.HandOff }));
    const [closeCode] = await once(webSocket, "close");

    expect(closeCode).toBe(HostCloseCode.SignatureRefused);
  });

  test("tells a page the host is stopping before its socket closes", async () => {
    expect.hasAssertions();

    const { webSocket } = await pair();
    const pendingHostStopping = waitForMessage(webSocket, ServerMessageType.HostStopping);
    const closing = server.close();

    await expect(pendingHostStopping).resolves.toStrictEqual({ type: ServerMessageType.HostStopping });

    await closing;
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

  test("refuses a plain request, so a page on another site cannot tell a host is running", async () => {
    expect.hasAssertions();

    const response = await fetch(`http://${DEFAULT_HOSTNAME}:${server.port}/`);

    expect(response.status).toBe(405);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  test("opens a session for the page that asked and replays its log to a page that connects later", async () => {
    expect.hasAssertions();

    const { paired, webSocket } = await pair();
    const pendingEvents = waitForMessage(webSocket, ServerMessageType.Events);
    const pendingSessionOpened = waitForMessage(webSocket, ServerMessageType.SessionOpened);
    webSocket.send(JSON.stringify({ cwd: " ", id: commandId, type: CommandType.CreateSession }));
    const sessionOpened = await pendingSessionOpened;
    const liveEvents = await pendingEvents;
    const laterWebSocket = connect();
    const pendingReplayedEvents = waitForMessage(laterWebSocket, ServerMessageType.Events);
    await once(laterWebSocket, "open");
    laterWebSocket.send(JSON.stringify({ credential: paired.credential, type: HandshakeMessageType.Authenticate }));

    expect(sessionOpened).toStrictEqual({ commandId, sessionId, type: ServerMessageType.SessionOpened });
    expect(liveEvents).toStrictEqual({ events, sessionId, type: ServerMessageType.Events });
    await expect(pendingReplayedEvents).resolves.toStrictEqual(liveEvents);
  });

  test("passes an ephemeral event to the pages connected now and keeps it from the log", async () => {
    expect.hasAssertions();

    const turnUsageEvents: AgentEvent[] = [{ createdAt, id: " ", outputTokens: 0, type: AgentEventType.TurnUsage }];
    const { paired, webSocket } = await pair();
    const pendingSessionOpened = waitForMessage(webSocket, ServerMessageType.SessionOpened);
    webSocket.send(JSON.stringify({ cwd: " ", id: commandId, type: CommandType.CreateSession }));
    await pendingSessionOpened;
    const pendingLiveEvents = waitForMessage(webSocket, ServerMessageType.Events);
    callbacks.onEvents(sessionId, turnUsageEvents);
    const liveEvents = await pendingLiveEvents;
    const laterWebSocket = connect();
    const pendingReplayedEvents = waitForMessage(laterWebSocket, ServerMessageType.Events);
    await once(laterWebSocket, "open");
    laterWebSocket.send(JSON.stringify({ credential: paired.credential, type: HandshakeMessageType.Authenticate }));
    const replayedEvents = await pendingReplayedEvents;

    expect(liveEvents.events).toStrictEqual(turnUsageEvents);
    expect(replayedEvents.events).toStrictEqual(events);
  });

  test("opens a shell for the page that asked, streams it, and replays its output to a page that connects later", async () => {
    expect.hasAssertions();

    const { paired, webSocket } = await pair();
    const pendingShellOpened = waitForMessage(webSocket, ServerMessageType.ShellOpened);
    webSocket.send(
      JSON.stringify({ cols: 1, cwd: " ", id: commandId, rows: 1, sessionId, type: CommandType.OpenShell }),
    );
    const { shellId } = await pendingShellOpened;
    const pendingShellOutput = waitForMessage(webSocket, ServerMessageType.ShellOutput);
    fakeTerminal.print(" ");
    const liveShellOutput = await pendingShellOutput;
    const laterWebSocket = connect();
    const pendingReplayedShellOpened = waitForMessage(laterWebSocket, ServerMessageType.ShellOpened);
    const pendingReplayedShellOutput = waitForMessage(laterWebSocket, ServerMessageType.ShellOutput);
    await once(laterWebSocket, "open");
    laterWebSocket.send(JSON.stringify({ credential: paired.credential, type: HandshakeMessageType.Authenticate }));

    expect(liveShellOutput).toStrictEqual({ data: " ", shellId, type: ServerMessageType.ShellOutput });
    await expect(pendingReplayedShellOpened).resolves.toStrictEqual({
      commandId: "",
      sessionId,
      shellId,
      type: ServerMessageType.ShellOpened,
    });
    await expect(pendingReplayedShellOutput).resolves.toStrictEqual(liveShellOutput);
  });

  test("ends a session's shells with the session", async () => {
    expect.hasAssertions();

    const { webSocket } = await pair();
    const pendingShellOpened = waitForMessage(webSocket, ServerMessageType.ShellOpened);
    webSocket.send(
      JSON.stringify({ cols: 1, cwd: " ", id: commandId, rows: 1, sessionId, type: CommandType.OpenShell }),
    );
    const { shellId } = await pendingShellOpened;
    const pendingShellClosed = waitForMessage(webSocket, ServerMessageType.ShellClosed);
    callbacks.onEvents(sessionId, [
      { createdAt, id: " ", state: SessionState.Closed, type: AgentEventType.SessionState },
    ]);

    await expect(pendingShellClosed).resolves.toStrictEqual({ shellId, type: ServerMessageType.ShellClosed });
  });

  test("answers a message that is not a command with why, under no command id", async () => {
    expect.hasAssertions();

    const { webSocket } = await pair();
    const pendingCommandError = waitForMessage(webSocket, ServerMessageType.CommandError);
    webSocket.send("{}");
    const commandError = await pendingCommandError;

    expect(commandError.commandId).toBe("");
  });

  test("closes a first message that is no handshake", async () => {
    expect.hasAssertions();

    const webSocket = connect();
    await once(webSocket, "open");
    webSocket.send("{}");
    const [closeCode] = await once(webSocket, "close");

    expect(closeCode).toBe(HostCloseCode.HandshakeRefused);
  });
});
