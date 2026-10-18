import type { IndirectStorageBufferAttribute, Node, WebGPURenderer } from "three/webgpu";

// A per-instance culling pass and the indirect draw its survivors are drawn with
export interface InstanceCulling {
  // Runs the pass for the frame: clears the count, then tests every instance. Called before the draw it feeds
  cull: (renderer: WebGPURenderer) => void;
  // The indirect draw's arguments, whose instance count the pass fills
  indirect: IndirectStorageBufferAttribute;
  // The instance a drawn survivor stands for, read at the draw's own instance index
  survivor: Node<"float">;
}
