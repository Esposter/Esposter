import { noop } from "@esposter/shared";
import { afterAll, vi } from "vitest";
/* eslint-disable no-restricted-syntax -- module scope is where a vitest setup file runs, and the environment it
   runs in is the one its config names rather than one SSR decides. The ban this suspends is about a browser
   global read before any phase could have chosen a branch, which is not a question a setup file has */
// There is no canvas in happy-dom, and a prototype spy on `getContext` is bypassed by its instance
// Method resolution, so the original createElement is stored and spied per-instance instead.
// oxlint-disable-next-line typescript/no-deprecated
const createElement = window.document.createElement.bind(window.document);
const mockCanvasContext: CanvasRenderingContext2D = {
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
};

vi.spyOn(window.document, "createElement").mockImplementation((tagName, options) => {
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
/* eslint-enable no-restricted-syntax */
