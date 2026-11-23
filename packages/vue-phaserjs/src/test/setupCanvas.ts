import { noop } from "@esposter/shared";
import { vi } from "vitest";

/* oxlint-disable selector-ban/no-restricted-syntax -- module scope is where a vitest setup file runs, and the environment it
   runs in is the one its config names rather than one SSR decides. The ban this suspends is about a browser
   global read before any phase could have chosen a branch, which is not a question a setup file has */
// There is no canvas in happy-dom, and a prototype spy on `getContext` is bypassed by its instance
// Method resolution, so the original createElement is stored and each canvas gets its own `getContext` instead.
// oxlint-disable-next-line typescript/no-deprecated -- `bind` resolves to the string-tag overload marked deprecated; the copy only forwards the call
const createElement = window.document.createElement.bind(window.document);
// The cast is needed: tsrs requires `lang` on the context, and TypeScript's DOM lib lacks it, so no literal fits both.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a fake context: the DOM lib's type has no `lang`, which tsrs requires, so the literal fits neither the lib's type nor tsrs's
const mockCanvasContext = {
  arc: noop,
  arcTo: noop,
  beginPath: noop,
  bezierCurveTo: noop,
  canvas: createElement("canvas"),
  clearRect: noop,
  clip: noop,
  closePath: noop,
  createConicGradient: () => ({ addColorStop: noop }),
  createImageData: () => ({ colorSpace: "srgb", data: new Uint8ClampedArray(4), height: 1, width: 1 }),
  createLinearGradient: () => ({ addColorStop: noop }),
  createPattern: () => null,
  createRadialGradient: () => ({ addColorStop: noop }),
  direction: "ltr",
  drawFocusIfNeeded: noop,
  drawImage: noop,
  ellipse: noop,
  fill: noop,
  fillRect: noop,
  fillStyle: "",
  fillText: noop,
  filter: "none",
  font: "",
  fontKerning: "auto",
  fontStretch: "normal",
  fontVariantCaps: "normal",
  getContextAttributes: () => ({}),
  getImageData: () => ({ colorSpace: "srgb", data: new Uint8ClampedArray(4), height: 1, width: 1 }),
  getLineDash: () => [],
  getTransform: () => new DOMMatrix(),
  globalAlpha: 1,
  globalCompositeOperation: "source-over",
  imageSmoothingEnabled: false,
  imageSmoothingQuality: "low",
  isContextLost: () => false,
  isPointInPath: () => false,
  isPointInStroke: () => false,
  lang: "inherit",
  letterSpacing: "0px",
  lineCap: "butt",
  lineDashOffset: 0,
  lineJoin: "miter",
  lineTo: noop,
  lineWidth: 1,
  measureText: () => ({
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    alphabeticBaseline: 0,
    emHeightAscent: 0,
    emHeightDescent: 0,
    fontBoundingBoxAscent: 0,
    fontBoundingBoxDescent: 0,
    hangingBaseline: 0,
    ideographicBaseline: 0,
    width: 0,
  }),
  miterLimit: 10,
  moveTo: noop,
  putImageData: noop,
  quadraticCurveTo: noop,
  rect: noop,
  reset: noop,
  resetTransform: noop,
  restore: noop,
  rotate: noop,
  roundRect: noop,
  save: noop,
  scale: noop,
  setLineDash: noop,
  setTransform: noop,
  shadowBlur: 0,
  shadowColor: "",
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  stroke: noop,
  strokeRect: noop,
  strokeStyle: "",
  strokeText: noop,
  textAlign: "start",
  textBaseline: "alphabetic",
  textRendering: "auto",
  transform: noop,
  translate: noop,
  wordSpacing: "0px",
} as unknown as CanvasRenderingContext2D;

/* The createElement wrapper and each canvas's getContext are plain properties, not vi.spyOn: a test file's
   vi.restoreAllMocks() restores spies, and a restored one hands back happy-dom's original, which has no context. Phaser
   pools its canvases, so a pooled canvas from an earlier test answers null to the next load that draws on it. A load a
   test starts can fire after the file's last test, so the properties stay for the whole file */
Object.defineProperty(window.document, "createElement", {
  configurable: true,
  value: (tagName: string, options?: ElementCreationOptions): HTMLElement => {
    const element = createElement(tagName, options);
    if (element instanceof HTMLCanvasElement)
      Object.defineProperty(element, "getContext", {
        configurable: true,
        value: (contextId: string) => (contextId === "2d" ? mockCanvasContext : null),
      });
    return element;
  },
  writable: true,
});
// `happy-dom` dispatches a data-URL image's `load` synchronously when its
// `src` is set, where a browser queues it as a task. Phaser's TextureManager registers its
// SYSTEM_READY listener only after it starts those loads, so a synchronous load let
// READY reach the scene manager first: the texture stamp was never made, and the frame after any
// `game.destroy` threw on It.
// The `src` is set on a task instead, so a game boots and becomes ready in the browser's order
vi.stubGlobal(
  "Image",
  class extends window.Image {
    override get src() {
      return super.src;
    }
    override set src(value: string) {
      setTimeout(() => {
        super.src = value;
      }, 0);
    }
  },
);

/* oxlint-enable selector-ban/no-restricted-syntax */
