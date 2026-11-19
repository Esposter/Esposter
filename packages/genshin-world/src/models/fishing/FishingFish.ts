import type { FishGeometryOptions, GroundPoint } from "genshin-engine";

// A fish hooked at the lure: the point it stands at, and the body its stand-in or fitted parameters draw it with
export interface FishingFish {
  position: GroundPoint;
  shape: FishGeometryOptions;
}
