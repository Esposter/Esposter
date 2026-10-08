import type { RegionData } from "#src/models/world/RegionData";
import type { GroundPoint } from "genshin-engine";

// Where an objective's target stands among the regions in reach, for the navigation marker to point at: the resident
// Or landmark it names, or the resident whose talk it names. An enemy or an item to collect is placed by no region
// Data yet, and neither is a target out of reach, so neither is found
export const findQuestTargetPosition = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  targetId: string,
): GroundPoint | undefined => {
  const regionDatas = [...regionDataMap.values()];
  const placed =
    regionDatas
      .flatMap(({ residents }) => residents)
      .find(({ id, talkId }) => id === targetId || talkId === targetId) ??
    regionDatas.flatMap(({ landmarks }) => landmarks).find(({ id }) => id === targetId);
  return placed?.position;
};
