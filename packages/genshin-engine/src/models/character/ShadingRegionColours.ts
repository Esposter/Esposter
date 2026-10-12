import type { Vector3Tuple } from "three";

// A colour for each shading region, by the region's number as the words of the game's own names give it: one is the
// Material's own, and two to five are its later regions' colours
export type ShadingRegionColours = Record<"five" | "four" | "one" | "three" | "two", Vector3Tuple>;
