import { TypedEventEmitter } from "#src/models/eventEmitter/TypedEventEmitter";
import { describe, expect, test, vi } from "vitest";

interface Events {
  "": (value: number) => void;
  ping: (value: number) => void;
}

describe(TypedEventEmitter, () => {
  test("passes the arguments to every listener on the event", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn<(value: number) => void>();
    emitter.on("ping", listener);

    expect(emitter.emit("ping", 1)).toBe(true);
    expect(listener).toHaveBeenCalledExactlyOnceWith(1);
  });

  test("returns false when no listener is registered", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();

    expect(emitter.emit("ping", 1)).toBe(false);
  });

  test("once runs its listener for one emit only", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn<(value: number) => void>();
    emitter.once("ping", listener);
    emitter.emit("ping", 1);
    emitter.emit("ping", 2);

    expect(listener).toHaveBeenCalledExactlyOnceWith(1);
  });

  test("off removes every registration of the listener", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn<(value: number) => void>();
    emitter.on("ping", listener);
    emitter.on("ping", listener);
    emitter.off("ping", listener);
    emitter.emit("ping", 1);

    expect(listener).not.toHaveBeenCalled();
  });

  test("a listener removed during an emit still runs for that emit", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const second = vi.fn<(value: number) => void>();
    emitter.on("ping", () => {
      emitter.off("ping", second);
    });
    emitter.on("ping", second);
    emitter.emit("ping", 1);

    expect(second).toHaveBeenCalledExactlyOnceWith(1);
  });

  test("a listener added during an emit waits for the next emit", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const added = vi.fn<(value: number) => void>();
    emitter.on("ping", () => {
      emitter.on("ping", added);
    });
    emitter.emit("ping", 1);

    expect(added).not.toHaveBeenCalled();
  });

  test("removeAllListeners without an event removes every event's listeners", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn<(value: number) => void>();
    emitter.on("ping", listener);
    emitter.removeAllListeners();

    expect(emitter.emit("ping", 1)).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  test("removeAllListeners on the empty event name leaves other events' listeners", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn<(value: number) => void>();
    emitter.on("", () => {});
    emitter.on("ping", listener);
    emitter.removeAllListeners("");
    emitter.emit("ping", 1);

    expect(listener).toHaveBeenCalledExactlyOnceWith(1);
  });

  test("on rejects a listener that is not a function", () => {
    expect.hasAssertions();

    const emitter = new TypedEventEmitter<Events>();

    expect(() => {
      // @ts-expect-error A listener of the wrong type is a compile error, and this checks the runtime guard behind it
      emitter.on("ping", undefined);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: ping, The listener must be a function]`,
    );
  });
});
