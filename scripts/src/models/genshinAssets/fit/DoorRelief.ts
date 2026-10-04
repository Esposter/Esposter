import type { Vector } from "#src/models/shared/Vector";

// The door's front relief read off its texture: the panel's raised bands and the gilding of its feet, each as its loops
// And its shade over the stone round it, inside the relief's corner and size
export interface DoorRelief {
  bands: { loops: [number, number][][]; shade: Vector };
  corner: [number, number];
  gilding: { loops: [number, number][][]; shade: Vector };
  size: [number, number];
}
