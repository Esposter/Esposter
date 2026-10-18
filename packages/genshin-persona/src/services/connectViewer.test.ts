import type { ViewerSocket } from "#src/services/connectViewer";

import { ViewerMessage } from "#src/models/ViewerMessage";
import { connectViewer } from "#src/services/connectViewer";
import { VIEWER_OPEN_READY_STATE } from "#src/services/constants";
import { describe, expect, test, vi } from "vitest";

// A socket the test answers by hand: opened or refused on demand, and the frames it is sent recorded
const createSocket = (isRefused: boolean) => {
  const listeners = new Map<string, ((event: unknown) => void)[]>();
  const sent: string[] = [];
  const socket: ViewerSocket = {
    addEventListener: (type: string, listener: (event: unknown) => void) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
    close: vi.fn(),
    readyState: VIEWER_OPEN_READY_STATE,
    send: (frame: string) => {
      sent.push(frame);
    },
  };
  const emit = (type: string, event: unknown) => {
    for (const listener of listeners.get(type) ?? []) listener(event);
  };
  queueMicrotask(() => {
    emit(isRefused ? "error" : "open", undefined);
  });
  return { emit, sent, socket };
};

describe(connectViewer, () => {
  test("registers as a model event listener and answers with a link", async () => {
    expect.hasAssertions();

    const { emit, sent, socket } = createSocket(false);
    const connecting = connectViewer("ws://127.0.0.1:10086", () => socket);
    await vi.waitFor(() => {
      expect(sent).toHaveLength(1);
    });
    emit("message", { data: JSON.stringify({ msg: ViewerMessage.Register, msgId: 1 }) });

    await expect(connecting).resolves.toBeDefined();
    expect(JSON.parse(sent[0] ?? "")).toStrictEqual({ msg: ViewerMessage.Register, msgId: 1 });
  });

  test("A malformed frame is ignored and the listener does not throw", async () => {
    expect.hasAssertions();

    const { emit, sent, socket } = createSocket(false);
    const connecting = connectViewer("ws://127.0.0.1:10086", () => socket);
    await vi.waitFor(() => {
      expect(sent).toHaveLength(1);
    });

    expect(() => {
      emit("message", { data: '{"msg":' });
    }).not.toThrow();
    emit("message", { data: JSON.stringify({ msg: ViewerMessage.Register, msgId: 1 }) });

    await expect(connecting).resolves.toBeDefined();
  });

  test("answers with nothing when the viewer refuses the connection", async () => {
    expect.hasAssertions();

    const { socket } = createSocket(true);

    await expect(connectViewer("ws://127.0.0.1:10086", () => socket)).resolves.toBeUndefined();
  });
});
