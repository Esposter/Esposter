import { NeutralToneMapping, WebGPURenderer } from "three/webgpu";

// WebGPU where the browser has it and WebGL 2 where it does not, chosen by three on its own. Multisampling is off
// Because the post chain renders to its own targets and anti-aliases there; the neutral tone mapping keeps each hue
// Where the palette put it, which a filmic curve would shift
export const createGenshinRenderer = (canvas: HTMLCanvasElement): WebGPURenderer => {
  const renderer = new WebGPURenderer({ antialias: false, canvas, powerPreference: "high-performance" });
  renderer.toneMapping = NeutralToneMapping;
  return renderer;
};
