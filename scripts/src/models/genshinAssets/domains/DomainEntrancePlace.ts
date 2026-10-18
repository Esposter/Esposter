import type { DomainEntranceLandmark } from "genshin-world";
import type { Except } from "type-fest";

// A domain entrance as its entry and point give it, before the region's landmarks file it under and the ground sets its
// Height above the ground. Its height is the point's own, in the game's axes
export type DomainEntrancePlace = Except<DomainEntranceLandmark, "areaId" | "heightOffset"> & { height: number };
