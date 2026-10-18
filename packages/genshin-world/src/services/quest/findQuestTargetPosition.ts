import type { RegionData } from "#src/models/world/RegionData";
import type { ResidentSpot } from "#src/models/world/ResidentSpot";
import type { GroundPoint } from "genshin-engine";

// Where an objective's target stands among the regions in reach, for the navigation marker to point at: a go-to place it
// Names, the resident or landmark it names, or the resident whose talk it names, at the spot they are shown at now. An enemy
// Or an item to collect is placed by no region data yet, and neither is a target out of reach or a resident absent at this
// Hour, so none of them is found
export const findQuestTargetPosition = (
  regionDataMap: ReadonlyMap<string, RegionData>,
  residentSpots: ReadonlyMap<string, ResidentSpot>,
  targetId: string,
): GroundPoint | undefined => {
  const regionDatas = [...regionDataMap.values()];
  const goToPlace = regionDatas.flatMap(({ goToPlaces }) => goToPlaces).find(({ id }) => id === targetId);
  if (goToPlace) return goToPlace.position;
  const resident = regionDatas
    .flatMap(({ residents }) => residents)
    .find(({ id, talkId }) => id === targetId || talkId === targetId);
  if (resident) return residentSpots.get(resident.id)?.position;
  return regionDatas.flatMap(({ landmarks }) => landmarks).find(({ id }) => id === targetId)?.position;
};
