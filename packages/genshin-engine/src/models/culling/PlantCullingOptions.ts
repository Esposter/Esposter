import type { Matrix4, Vector3 } from "three";
import type { StorageBufferAttribute, UniformNode } from "three/webgpu";

export interface PlantCullingOptions {
  // The plants' matrices packed in one storage buffer (`createInstanceMatrixBuffer`), one instance each
  attribute: StorageBufferAttribute;
  // A plant's box in its own units: its base and height along the upright axis and its half width to each side
  bounds: { bottom: number; halfWidth: number; height: number };
  clipFromModel: UniformNode<"mat4", Matrix4>;
  // How far from the eye a plant's base may stand and still be drawn
  drawDistance: number;
  // The eye in the plants' own coordinates, from which the draw distance is measured
  eye: UniformNode<"vec3", Vector3>;
  // The index count of the geometry each survivor is drawn with
  indexCount: number;
}
