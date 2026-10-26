import type { ViewerSocket } from "#src/services/connectViewer";

import { ViewerMessage } from "#src/models/ViewerMessage";
import { connectViewer } from "#src/services/connectViewer";
import { VIEWER_OPEN_READY_STATE } from "#src/services/constants";
import { describe, expect, test, vi } from "vitest";

// A socket the test answers by hand: opened or refused on demand, and the frames it is sent recorded, with the first
// One's arrival awaitable
const createSocket = (isRefused: boolean) => {
  const listeners = new Map<string, ((event: unknown) => void)[]>();
  const sent: string[] = [];
  const { promise: firstFrameSent, resolve: resolveFirstFrameSent } = Promise.withResolvers<void>();
  const socket: ViewerSocket = {
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    close: vi.fn<ViewerSocket["close"]>(),
    readyState: VIEWER_OPEN_READY_STATE,
    send: (frame: string) => {
      sent.push(frame);
      resolveFirstFrameSent();
    },
  };
  const emit = (type: string, event: unknown) => {
    for (const listener of listeners.get(type) ?? []) listener(event);
  };
  queueMicrotask(() => {
    emit(isRefused ? "error" : "open", undefined);
  });
  return { emit, firstFrameSent, sent, socket };
};

describe(connectViewer, () => {
  const registerFrame = JSON.stringify({ msg: ViewerMessage.Register, msgId: 1 });

  test("registers as a model event listener and answers with a link", async () => {
    expect.hasAssertions();

    const { emit, firstFrameSent, sent, socket } = createSocket(false);
    const connecting = connectViewer("ws://127.0.0.1:10086", () => socket);
    await firstFrameSent;
    emit("message", { data: registerFrame });

    await expect(connecting).resolves.toBeDefined();
    expect(sent).toStrictEqual([registerFrame]);
  });

  test("a malformed frame is ignored and the listener does not throw", async () => {
    expect.hasAssertions();

    const { emit, firstFrameSent, socket } = createSocket(false);
    const connecting = connectViewer("ws://127.0.0.1:10086", () => socket);
    await firstFrameSent;

    expect(() => {
      emit("message", { data: '{"msg":' });
    }).not.toThrow();
    emit("message", { data: registerFrame });

    await expect(connecting).resolves.toBeDefined();
  });

  test("answers with nothing when the viewer refuses the connection", async () => {
    expect.hasAssertions();

    const { socket } = createSocket(true);

    await expect(connectViewer("ws://127.0.0.1:10086", () => socket)).resolves.toBeUndefined();
  });
});
