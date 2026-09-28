// @vitest-environment nuxt
import { ConnectionStatus } from "@/models/agentConsole/ConnectionStatus";
import { LOCAL_HOST_ADDRESS } from "@/services/agentConsole/constants";
import { useAgentConsoleConnectionStore } from "@/store/agentConsole/connection";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { takeOne } from "@esposter/shared";
import {
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

const signProof = async (privateKey: CryptoKey, nonce: string) =>
  new Uint8Array(
    await crypto.subtle.sign(
      { name: "Ed25519" },
      privateKey,
      new TextEncoder().encode(getSignedText(SignaturePurpose.HostProof, nonce)),
    ),
  ).toBase64({ alphabet: "base64url" });

const dispatchMessage = (socket: FakeWebSocket, data: object) => {
  socket.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(data) }));
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
    agentConsoleConnectionStore.pairedHost = { address: LOCAL_HOST_ADDRESS, credential, deviceId, publicKey };
    agentConsoleConnectionStore.connect();
    const socket = takeOne(FakeWebSocket.sockets);
    socket.dispatchEvent(new Event("open"));
    // oxlint-disable-next-line no-restricted-properties -- the page's own challenge, read back as the test's host would
    const { nonce } = JSON.parse(takeOne(socket.send.mock.calls)[0]) as { nonce: string };
    return { agentConsoleConnectionStore, nonce, socket };
  };

  test("refuses a linked address that is not a WebSocket URL instead of retrying it forever", () => {
    expect.hasAssertions();

    vi.unstubAllGlobals();
    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { pairedHost, status } = storeToRefs(agentConsoleConnectionStore);
    const { pairLinkedHost } = agentConsoleConnectionStore;
    pairLinkedHost("a", crypto.randomUUID());

    expect(status.value).toBe(ConnectionStatus.Unpaired);
    expect(pairedHost.value.credential).toBe("");
  });

  test("sends its credential only once the host has signed its challenge", async () => {
    expect.hasAssertions();

    const { privateKey, publicKey } = await createHostKeyPair();
    const { nonce, socket } = connectPaired(publicKey);
    const pendingSend = new Promise<string>((resolve) => {
      socket.send.mockImplementation(resolve);
    });
    dispatchMessage(socket, {
      nonce: " ",
      signature: await signProof(privateKey, nonce),
      type: ServerMessageType.Proof,
    });

    // oxlint-disable-next-line no-restricted-properties -- the page's message, read back as the test's host would
    expect(JSON.parse(await pendingSend)).toStrictEqual({ credential, type: HandshakeMessageType.Authenticate });
  });

  test("sends nothing to a program on the port that cannot sign with the host's key", async () => {
    expect.hasAssertions();

    const { publicKey } = await createHostKeyPair();
    const { privateKey: otherPrivateKey } = await createHostKeyPair();
    const { nonce, socket } = connectPaired(publicKey);
    const pendingClose = new Promise<void>((resolve) => {
      socket.close.mockImplementation(resolve);
    });
    dispatchMessage(socket, {
      nonce: " ",
      signature: await signProof(otherPrivateKey, nonce),
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
    expect(agentConsoleConnectionStore.pairedHost.credential).toBe("");
  });

  test("keeps the credential a pairing hands it", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const code = crypto.randomUUID();
    agentConsoleConnectionStore.pairLinkedHost(LOCAL_HOST_ADDRESS, code);
    const socket = takeOne(FakeWebSocket.sockets);
    socket.dispatchEvent(new Event("open"));
    dispatchMessage(socket, { credential, deviceId, publicKey: " ", type: ServerMessageType.Paired });

    // oxlint-disable-next-line no-restricted-properties -- the page's message, read back as the test's host would
    expect(JSON.parse(takeOne(socket.send.mock.calls)[0])).toStrictEqual({ code, type: HandshakeMessageType.Pair });
    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Connected);
    expect(agentConsoleConnectionStore.pairedHost).toStrictEqual({
      address: LOCAL_HOST_ADDRESS,
      credential,
      deviceId,
      publicKey: " ",
    });
  });

  test("unpairs to a page with nothing of the host left open", () => {
    expect.hasAssertions();

    const agentConsoleConnectionStore = useAgentConsoleConnectionStore();
    const { unpair } = agentConsoleConnectionStore;
    const agentConsolePanelStore = useAgentConsolePanelStore();
    const { isConsoleOpen, isPauseMenuOpen } = storeToRefs(agentConsolePanelStore);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { currentSessionId, sessions } = storeToRefs(agentConsoleSessionStore);
    const sessionId = crypto.randomUUID();
    sessions.value = [{ cwd: "", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }];
    currentSessionId.value = sessionId;
    isConsoleOpen.value = true;
    isPauseMenuOpen.value = true;
    unpair();

    expect(sessions.value).toHaveLength(0);
    expect(currentSessionId.value).toBe("");
    expect(isConsoleOpen.value).toBe(false);
    expect(isPauseMenuOpen.value).toBe(false);
  });

  // A host stopped from its own window says so first, and the page waits to be asked rather than retrying forever
  test("shows a host that said it was stopping as stopped, with its sessions closed, and does not retry it", async () => {
    expect.hasAssertions();

    const { privateKey, publicKey } = await createHostKeyPair();
    const { agentConsoleConnectionStore, nonce, socket } = connectPaired(publicKey);
    const agentConsoleSessionStore = useAgentConsoleSessionStore();
    const { sessions } = storeToRefs(agentConsoleSessionStore);
    const sessionId = crypto.randomUUID();
    sessions.value = [{ cwd: "", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Idle, title: "" }];
    const pendingSend = new Promise<string>((resolve) => {
      socket.send.mockImplementation(resolve);
    });
    dispatchMessage(socket, {
      nonce: " ",
      signature: await signProof(privateKey, nonce),
      type: ServerMessageType.Proof,
    });
    await pendingSend;
    vi.useFakeTimers();
    dispatchMessage(socket, { type: ServerMessageType.Authenticated });
    dispatchMessage(socket, { type: ServerMessageType.HostStopping });
    socket.dispatchEvent(new Event("close"));
    vi.runAllTimers();

    expect(agentConsoleConnectionStore.status).toBe(ConnectionStatus.Stopped);
    expect(sessions.value.map(({ state }) => state)).toStrictEqual([SessionState.Closed]);
    expect(FakeWebSocket.sockets).toHaveLength(1);
  });
});
