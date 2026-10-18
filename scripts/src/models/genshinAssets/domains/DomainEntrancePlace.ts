import type { DomainEntranceLandmark } from "genshin-world";
import type { Except } from "type-fest";

// A domain entrance as its entry and point give it, before the catalogue area it is filed under is found, the ground sets
// Its height above the ground and its arrival is set. Its height is the point's own, in the game's axes, and its game area
// Is the level-one area id the point stands in, 0 for none
export type DomainEntrancePlace = Except<DomainEntranceLandmark, "areaId" | "arrival" | "heightOffset"> & {
  gameAreaId: number;
  height: number;
};
