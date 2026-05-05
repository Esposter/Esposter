// Phaser's DOMContentLoaded helper checks document.readyState before booting;
import { noop } from "@esposter/shared";

// In happy-dom the document is already loaded so report it as complete
Object.defineProperty(document, "readyState", { configurable: true, get: () => "complete" });
// Phaser's TextureManager loads 3 default base64 images via `new Image(); image.src = data`.
// In happy-dom the Image load event never fires, so TextureManager._pending stays at 3 and
// The TextureManager never emits READY — which means SceneManager.bootQueue() never runs
// And SceneManager.isBooted stays false. Stub Image.src to call onload synchronously.
Object.defineProperty(HTMLImageElement.prototype, "src", {
  configurable: true,
  get(): string {
    return "";
  },
  set(this: HTMLImageElement) {
    if (typeof this.onload === "function") this.onload(new Event("load"));
  },
});
// Happy-dom does not implement canvas rendering — stub getContext before Phaser loads
// To satisfy Phaser's CanvasFeatures detection which runs at module initialisation time
HTMLCanvasElement.prototype.getContext = ((contextId: string) =>
  contextId === "2d"
    ? ({
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
      } as unknown as CanvasRenderingContext2D)
    : null) as typeof HTMLCanvasElement.prototype.getContext;
