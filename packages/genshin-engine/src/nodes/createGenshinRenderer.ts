/// <reference types="vite/client" />
import { attachInspector } from "#src/renderer/attachInspector";
import { GENSHIN_TONE_MAPPING } from "#src/renderer/constants";
import { WebGPURenderer } from "three/webgpu";

// WebGPU where the browser has it and WebGL 2 where it does not, chosen by three on its own. Multisampling is off
// Because the post chain renders to its own targets and anti-aliases there
export const createGenshinRenderer = (canvas: HTMLCanvasElement): WebGPURenderer => {
  // The discrete GPU is asked for where the browser honours the ask; on Windows it chooses by the system's own
  // Setting and warns of the option as ignored
  const isWindows = window.navigator.userAgent.includes("Windows");
  const renderer = new WebGPURenderer({
    antialias: false,
    canvas,
    ...(isWindows ? {} : { powerPreference: "high-performance" }),
  });
  renderer.toneMapping = GENSHIN_TONE_MAPPING;
  // A Vite development build hands every scene three's inspector, so none has to ask for it, and a production build
  // Drops the branch. A browser driven by automation is shooting or timing the scene, which the panel would cover
  // And slow, and a bundler with no `import.meta.env` leaves it off
  // eslint-disable-next-line no-restricted-syntax -- a package has no `#shared`, and this is its one read of the build mode
  if (import.meta.env?.DEV && !window.navigator.webdriver)
    // oxlint-disable-next-line typescript/no-floating-promises -- TresJS takes the renderer back synchronously, and a failed import reaches the console as an unhandled rejection
    attachInspector(renderer);
  return renderer;
};
