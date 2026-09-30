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
  return renderer;
};
