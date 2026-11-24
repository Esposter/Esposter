import { describe } from "vitest";

// The browser's image element stands in for the node environment's missing one: its source is set, and its load fires
// On the next tick, so a test drives a rasterization without a browser
export class ImageDouble {
  onload?: () => void;
  get src() {
    return this.#source;
  }

  set src(source: string) {
    this.#source = source;
    queueMicrotask(() => {
      this.onload?.();
    });
  }

  #source = "";
}

describe.todo("imageDouble");
