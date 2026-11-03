import type { MapCamera } from "#src/models/map/MapCamera";
import type { RegionData } from "#src/models/world/RegionData";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { Ref } from "vue";

// What the quests' targets are placed from: the regions in reach and the spots their residents stand at, the camera whose
// Ground point the character stands at, the one ground the heights are read off, and the quests and the target navigated to
export interface WorldQuestTargetsOptions {
  mapCamera: Readonly<Ref<MapCamera>>;
  windrise: Readonly<
    Ref<
      | null
      | undefined
      | { regionDataMap: ReadonlyMap<string, RegionData>; residentSpots: ReadonlyMap<string, ResidentSpot> }
    >
  >;
}
