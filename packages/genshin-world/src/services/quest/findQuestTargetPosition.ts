import type { RegionData } from "#src/models/world/RegionData";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { GroundPoint } from "genshin-engine";

// Where an objective's target stands among the regions in reach, for the navigation marker to point at: the resident
// Or landmark it names, or the resident whose talk it names, at the spot they are shown at now. An enemy or an item to
// Collect is placed by no region data yet, and neither is a target out of reach or a resident absent at this hour, so
// None of them is found
export const findQuestTargetPosition = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  residentSpots: ReadonlyMap<string, ResidentSpot>,
  targetId: string,
): GroundPoint | undefined => {
  const regionDatas = [...regionDataMap.values()];
  const resident = regionDatas
    .flatMap(({ residents }) => residents)
    .find(({ id, talkId }) => id === targetId || talkId === targetId);
  if (resident) return residentSpots.get(resident.id)?.position;
  return regionDatas.flatMap(({ landmarks }) => landmarks).find(({ id }) => id === targetId)?.position;
};
