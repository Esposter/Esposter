import type { LatheSection } from "#src/models/kits/architecture/LatheSection";
import type { Vector3 } from "three";

// A smokestack standing on its foot at position, its sections stacked from the foot up
export interface Smokestack {
  position: Vector3;
  sections: LatheSection[];
}
