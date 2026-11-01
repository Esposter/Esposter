import type { MapCamera } from "#src/models/map/MapCamera";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { RegionData } from "#src/models/world/RegionData";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

// What the quests' targets are placed from: the regions in reach and the spots their residents stand at, the camera whose
// Ground point the character stands at, the one ground the heights are read off, and the quests and the target navigated to
export interface WorldQuestTargetsOptions {
  events: WorldEvents;
  getGroundHeight: (x: number, z: number) => number;
  mapCamera: Readonly<Ref<MapCamera>>;
  questProgressMap: Readonly<Ref<ReadonlyMap<string, QuestProgress>>>;
  questsInProgress: Readonly<Ref<Quest[]>>;
  questTargetId: Readonly<Ref<string | undefined>>;
  windrise: Readonly<
    Ref<
      | null
      | undefined
      | { regionDataMap: ReadonlyMap<string, RegionData>; residentSpots: ReadonlyMap<string, ResidentSpot> }
    >
  >;
}
