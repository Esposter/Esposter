import type { GenshinRendererOptions } from "#src/models/renderer/GenshinRendererOptions";

import { GENSHIN_TONE_MAPPING } from "#src/renderer/constants";
import { WebGPURenderer } from "three/webgpu";

// WebGPU where the browser has it and WebGL 2 where it does not, chosen by three on its own. Multisampling is off
// Because the post chain renders to its own targets and anti-aliases there
export const createGenshinRenderer = (
  canvas: HTMLCanvasElement,
  { honoursPowerPreference }: GenshinRendererOptions,
): WebGPURenderer => {
  // The discrete GPU is asked for where the browser honours the ask; where it does not, the browser chooses by the
  // System's own setting and warns of the option as ignored
  const renderer = new WebGPURenderer({
    antialias: false,
    canvas,
    ...(honoursPowerPreference ? { powerPreference: "high-performance" } : {}),
  });
  renderer.toneMapping = GENSHIN_TONE_MAPPING;
  return renderer;
};
