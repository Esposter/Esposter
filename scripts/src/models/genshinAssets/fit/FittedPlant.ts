import type { GroundPoint } from "genshin-engine";

// A plant prefab's name and every place it stands, in our region's axes, each with the scale its placement holds
export interface FittedPlant {
  name: string;
  places: { position: GroundPoint; rotation: number; scale: number[] }[];
}
