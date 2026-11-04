import { describe, vi } from "vitest";

// A DOM without layout never reports a width, so every element the grid observes reports the width given
export const stubGridWidth = (width: number) => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      readonly #callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
      }

      disconnect() {}
      observe(target: Element) {
        const entries = [{ contentRect: { height: 0, width }, target }] as ResizeObserverEntry[];
        queueMicrotask(() => {
          this.#callback(entries, this);
        });
      }
      unobserve() {}
    },
  );
};

describe.todo("stubGridWidth");
