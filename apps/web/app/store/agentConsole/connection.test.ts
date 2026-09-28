// @vitest-environment nuxt
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { LOCAL_HOST_ADDRESS } from "@/services/agentConsole/constants";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { takeOne } from "@esposter/shared";
import {
  DEFAULT_PORT,
  getSignedText,
  HandshakeMessageType,
  HostCloseCode,
  ServerMessageType,
  SessionState,
  SignaturePurpose,
} from "agent-console-server/contracts";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

class FakeWebSocket extends EventTarget {
  static readonly OPEN = 1;
  static sockets: FakeWebSocket[] = [];
  close = vi.fn<() => void>();
  readyState = FakeWebSocket.OPEN;
  send = vi.fn<(data: string) => void>();
  constructor() {
    super();
    FakeWebSocket.sockets.push(this);
  }
}

const createHostKeyPair = async () => {
  const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const { x = "" } = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  return { privateKey: keyPair.privateKey, publicKey: x };
};

const signProof = async (privateKey: CryptoKey, nonce: string, port = DEFAULT_PORT) =>
  new Uint8Array(
    await crypto.subtle.sign(
      { name: "Ed25519" },
      privateKey,
      new TextEncoder().encode(getSignedText(SignaturePurpose.HostProof, port, nonce)),
    ),
  ).toBase64({ alphabet: "base64url" });

const dispatchMessage = (socket: FakeWebSocket, data: object) => {
  socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) }));
};

// The page's own challenge, read back as the test's host would
const readNonce = (socket: FakeWebSocket) =>
  // oxlint-disable-next-line no-restricted-properties -- the page's message, read back as the test's host would
  (JSON.parse(takeOne(socket.send.mock.calls)[0]) as { nonce: string }).nonce;

// A host proving itself and admitting the page, resolved with the credential message the page sent it
const admit = async (socket: FakeWebSocket, privateKey: CryptoKey, port = DEFAULT_PORT) => {
  const nonce = readNonce(socket);
  const pendingSend = new Promise<string>((resolve) => {
    socket.send.mockImplementation(resolve);
  });
  dispatchMessage(socket, {
    nonce: " ",
    port,
    signature: await signProof(privateKey, nonce, port),
    type: ServerMessageType.Proof,
  });
  const credentialMessage = await pendingSend;
  dispatchMessage(socket, { type: ServerMessageType.Authenticated });
  return credentialMessage;
};

describe(useAgentConsoleConnectionStore, () => {
  const credential = crypto.randomUUID();
  const deviceId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
    FakeWebSocket.sockets = [];
    vi.stubGlobal("WebSocket", FakeWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  // A page opens its socket with its credential in hand, as it does after a reload
  const connectPaired = (publicKey: string) => {
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const connectionId = crypto.randomUUID();
    agentConsoleConnectionStore.connections = [
      { address: LOCAL_HOST_ADDRESS, credential, deviceId, id: connectionId, publicKey },
    ];
    agentConsoleConnectionStore.connect();
    const socket = takeOne(FakeWebSocket.sockets);
    socket.dispatchEvent(new Event("open"));
    return { agentConsoleConnectionStore, connectionId, socket };
  };

  test("refuses a linked address that is not a WebSocket URL instead of retrying it forever", () => {
    expect.hasAssertions();

    vi.unstubAllGlobals();
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    agentConsoleConnectionStore.pairLinkedHost("a", crypto.randomUUID());

    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Unpaired);
    expect(agentConsoleConnectionStore.connections).toHaveLength(0);
  });

  test("sends its credential only once the host has signed its challenge", async () => {
    expect.hasAssertions();

    const { privateKey, publicKey } = await createHostKeyPair();
    const { agentConsoleConnectionStore, socket } = connectPaired(publicKey);
    const credentialMessage = await admit(socket, privateKey);

    // oxlint-disable-next-line no-restricted-properties -- the page's message, read back as the test's host would
    expect(JSON.parse(credentialMessage)).toStrictEqual({ credential, type: HandshakeMessageType.Authenticate });
    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Connected);
  });

  test("sends nothing to a program on the port that cannot sign with the host's key", async () => {
    expect.hasAssertions();

    const { publicKey } = await createHostKeyPair();
    const { privateKey: otherPrivateKey } = await createHostKeyPair();
    const { socket } = connectPaired(publicKey);
    const nonce = readNonce(socket);
    const pendingClose = new Promise<void>((resolve) => {
      socket.close.mockImplementation(resolve);
    });
    dispatchMessage(socket, {
      nonce: " ",
      port: DEFAULT_PORT,
      signature: await signProof(otherPrivateKey, nonce),
      type: ServerMessageType.Proof,
    });
    await pendingClose;

    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  // Another program on a port beside the host's can relay the page's challenge to the host, whose proof then names
  // The host's own port rather than the one the page reached
  test("sends nothing to a program relaying its challenge to the host on another port", async () => {
    expect.hasAssertions();

    const { privateKey, publicKey } = await createHostKeyPair();
    const { socket } = connectPaired(publicKey);
    const nonce = readNonce(socket);
    const pendingClose = new Promise<void>((resolve) => {
      socket.close.mockImplementation(resolve);
    });
    dispatchMessage(socket, {
      nonce: " ",
      port: DEFAULT_PORT + 1,
      signature: await signProof(privateKey, nonce, DEFAULT_PORT + 1),
      type: ServerMessageType.Proof,
    });
    await pendingClose;

    expect(socket.send).toHaveBeenCalledTimes(1);
  });

  test("forgets a host that no longer knows its credential", () => {
    expect.hasAssertions();

    const { agentConsoleConnectionStore, socket } = connectPaired(" ");
    socket.dispatchEvent(new CloseEvent("close", { code: HostCloseCode.CredentialRefused }));

    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Unpaired);
    expect(agentConsoleConnectionStore.connections).toHaveLength(0);
  });

  test("keeps the credential a pairing hands it", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const code = crypto.randomUUID();
    agentConsoleConnectionStore.pairLinkedHost(LOCAL_HOST_ADDRESS, code);
    const socket = takeOne(FakeWebSocket.sockets);
    socket.dispatchEvent(new Event("open"));
    dispatchMessage(socket, { credential, deviceId, publicKey: " ", type: ServerMessageType.Paired });
    const { id } = takeOne(agentConsoleConnectionStore.connections);

    // oxlint-disable-next-line no-restricted-properties -- the page's message, read back as the test's host would
    expect(JSON.parse(takeOne(socket.send.mock.calls)[0])).toStrictEqual({ code, type: HandshakeMessageType.Pair });
    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Connected);
    expect(agentConsoleConnectionStore.connections).toStrictEqual([
      { address: LOCAL_HOST_ADDRESS, credential, deviceId, id, publicKey: " " },
    ]);
  });

  test("unpairs to a page with nothing of the host left open", () => {
    expect.hasAssertions();

    const { agentConsoleConnectionStore, connectionId } = connectPaired(" ");
    const agentConsolePanelStore = useAgentConsolePanelStore();
    const { isConsoleOpen, isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
    const sessionId = crypto.randomUUID();
    sessions.value = [
      { connectionId, cwd: "", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" },
    ];
    currentSessionId.value = sessionId;
    isConsoleOpen.value = true;
    isPauseMenuOpen.value = true;
    agentConsoleConnectionStore.unpair();

    expect(sessions.value).toHaveLength(0);
    expect(currentSessionId.value).toBe("");
    expect(isConsoleOpen.value).toBe(false);
    expect(isPauseMenuOpen.value).toBe(false);
  });

  // A host stopped from its own window says so first, and the page waits to be asked rather than retrying forever,
  // While every other host it holds stays as it was
  test("shows a stopped host stopped with its sessions closed, and leaves another host connected", async () => {
    expect.hasAssertions();

    const { privateKey, publicKey } = await createHostKeyPair();
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const stoppingConnectionId = crypto.randomUUID();
    const remoteConnectionId = crypto.randomUUID();
    agentConsoleConnectionStore.connections = [
      { address: LOCAL_HOST_ADDRESS, credential, deviceId, id: stoppingConnectionId, publicKey },
      { address: "wss://a", credential, deviceId, id: remoteConnectionId, publicKey },
    ];
    agentConsoleConnectionStore.connect();
    const stoppingSocket = takeOne(FakeWebSocket.sockets);
    const remoteSocket = takeOne(FakeWebSocket.sockets, 1);
    stoppingSocket.dispatchEvent(new Event("open"));
    remoteSocket.dispatchEvent(new Event("open"));
    await admit(stoppingSocket, privateKey);
    // A remote host behind a proxy signs the port it listens on, which is not the one the page reached
    await admit(remoteSocket, privateKey, DEFAULT_PORT);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { sessions } = storeToRefs(agentConsoleSessionStore);
    const stoppingSessionId = crypto.randomUUID();
    const remoteSessionId = crypto.randomUUID();
    dispatchMessage(stoppingSocket, {
      sessions: [{ cwd: "", id: stoppingSessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }],
      type: ServerMessageType.Sessions,
    });
    dispatchMessage(remoteSocket, {
      sessions: [{ cwd: "", id: remoteSessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }],
      type: ServerMessageType.Sessions,
    });
    vi.useFakeTimers();
    dispatchMessage(stoppingSocket, { type: ServerMessageType.HostStopping });
    stoppingSocket.dispatchEvent(new Event("close"));
    vi.runAllTimers();

    expect(
      agentConsoleConnectionStore.connectionStatuses.map(({ connection, status }) => [connection.id, status]),
    ).toStrictEqual([
      [stoppingConnectionId, ConnectionStatus.Stopped],
      [remoteConnectionId, ConnectionStatus.Connected],
    ]);
    expect(sessions.value.map(({ id, state }) => [id, state])).toStrictEqual([
      [remoteSessionId, SessionState.Idle],
      [stoppingSessionId, SessionState.Closed],
    ]);
    expect(FakeWebSocket.sockets).toHaveLength(2);
  });
});
