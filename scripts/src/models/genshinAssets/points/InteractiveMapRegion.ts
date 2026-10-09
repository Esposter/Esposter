import type { OculusKind } from "genshin-world";

// A region's place on the official map: the map's area it lies in, and its Oculi by kind and the wiki's count
export interface InteractiveMapRegion {
  areaId: number;
  oculus: { count: number; kind: OculusKind };
}
