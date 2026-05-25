import { noop } from "@esposter/shared";
import { afterAll, vi } from "vitest";

// These stubs must run at module scope — phaser checks canvas/image APIs at import time
// (setup.ts imports phaser AFTER this file, per setupFiles order).

// In happy-dom the document is already loaded so report it as complete
vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
// Phaser's TextureManager loads 3 default base64 images via `new Image(); image.src = data`.
// In happy-dom the Image load event never fires, so TextureManager._pending stays at 3 and
// the TextureManager never emits READY — which means SceneManager.bootQueue() never runs
// and SceneManager.isBooted stays false. Stub Image.src to call onload synchronously.
vi.spyOn(HTMLImageElement.prototype, "src", "set").mockImplementation(function (this: HTMLImageElement) {
  if (typeof this.onload === "function") this.onload(new Event("load"));
});
// Happy-dom does not implement canvas rendering. Phaser creates canvases via CanvasPool
// which calls document.createElement('canvas'), then calls getContext('2d', ...) during
// module initialisation (checkInverseAlpha / checkBlendMode). Spying on
// HTMLCanvasElement.prototype.getContext is ineffective because happy-dom's instance
// method resolution bypasses the prototype spy. Instead, intercept document.createElement
// and spy on getContext per-instance so vi.restoreAllMocks() tracks the cleanup.
const mockCanvasContext = {
  beginPath: noop,
  clearRect: noop,
  clip: noop,
  drawImage: noop,
  fillRect: noop,
  fillStyle: "",
  fillText: noop,
  font: "",
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  globalCompositeOperation: "",
  measureText: () => ({ actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0, width: 0 }),
  putImageData: noop,
  restore: noop,
  rotate: noop,
  save: noop,
  scale: noop,
  setLineDash: noop,
  setTransform: noop,
  stroke: noop,
  strokeRect: noop,
  strokeText: noop,
  transform: noop,
  translate: noop,
} as unknown as CanvasRenderingContext2D;

const createElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
  const element = createElement(tagName, options);
  if (tagName.toLowerCase() === "canvas")
    vi.spyOn(element as HTMLCanvasElement, "getContext").mockImplementation((contextId) =>
      contextId === "2d" ? mockCanvasContext : null,
    );
  return element;
});

afterAll(() => {
  vi.restoreAllMocks();
});
