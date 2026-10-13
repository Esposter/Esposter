import type { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import type { Renderer } from "three/webgpu";

// Three's inspector on the renderer, its profiler, scene viewer and parameter panels shared by whatever asks for it.
// The renderer disposes the inspector with itself
export const attachInspector = async (renderer: Renderer): Promise<Inspector> => {
  // eslint-disable-next-line no-restricted-syntax -- the inspector is imported on demand, so a build that never attaches one never loads it
  const { Inspector } = await import("three/examples/jsm/inspector/Inspector.js");
  // Nothing awaits between the check and the assignment, so a second caller finds the first one's inspector
  if (renderer.inspector instanceof Inspector) return renderer.inspector;
  const inspector = new Inspector();
  renderer.inspector = inspector;
  return inspector;
};
