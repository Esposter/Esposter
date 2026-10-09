import type { ExcelWorldAreaExploreEventRow } from "#src/models/genshinAssets/exploration/ExcelWorldAreaExploreEventRow";
import type { ExplorationDoing } from "genshin-world";

import { ExploreEventKindMap } from "#src/services/genshinAssets/exploration/ExploreEventKindMap";

// One explore event as a doing the progress counts, or none when its type is not one of the kinds it counts
export const toExplorationDoing = ({
  EventID,
  EventType,
  ExploreWeight,
}: ExcelWorldAreaExploreEventRow): ExplorationDoing | undefined => {
  const kind = ExploreEventKindMap[EventType];
  if (!kind) return undefined;
  return { id: String(EventID), kind, weight: ExploreWeight };
};
