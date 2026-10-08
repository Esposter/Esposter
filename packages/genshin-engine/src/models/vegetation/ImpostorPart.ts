import type { BufferGeometry, ColorRepresentation } from "three";
import type { Node } from "three/webgpu";

// One part of what an impostor is baked from, drawn in its own colour: a tree's wood or its leaves, the leaves cut to
// Their shape where their opacity falls under a half
export interface ImpostorPart {
  color: ColorRepresentation;
  geometry: BufferGeometry;
  opacityNode?: Node<"float">;
}
