import type { BufferGeometry, ColorRepresentation } from "three";
import type { Node } from "three/webgpu";

// One part of what an impostor is baked from, drawn in its own colour: a tree's wood or its leaves, the leaves cut to
// Their shape by their mask
export interface ImpostorPart {
  color: ColorRepresentation;
  geometry: BufferGeometry;
  maskNode?: Node<"bool">;
}
