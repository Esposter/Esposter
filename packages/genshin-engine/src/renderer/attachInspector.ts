import type { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import type { Renderer } from "three/webgpu";

// Three's inspector on the renderer, its profiler, scene viewer and parameter panels shared by whatever asks for it.
// It is imported on demand, so a build that never asks never loads it, and the renderer disposes it with itself
export const attachInspector = async (renderer: Renderer): Promise<Inspector> => {
  const { Inspector } = await import("three/examples/jsm/inspector/Inspector.js");
  // Nothing awaits between the check and the assignment, so a second caller finds the first one's inspector
  if (renderer.inspector instanceof Inspector) return renderer.inspector;
  const inspector = new Inspector();
  renderer.inspector = inspector;
  return inspector;
};
