import type { Catalogue } from "#src/models/world/Catalogue";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { JUMP_LANDMARK_KINDS } from "#src/services/map/constants";
import { readRegionData } from "#src/services/world/readRegionData";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// Every landmark a jump lands at across the whole catalogue rather than the regions in reach, since the map shows the
// Whole continent: each region's data is read once, and a region that fails is logged and left off. The list is complete
// Once every region has settled, read or failed, so isLoaded is the point a landmark can be counted in full. The domain
// Entrances are listed beside them, since a player unlocks one as a waypoint but no jump lands at one
export const useJumpLandmarks = (regionDataBaseUrl: string, catalogue: Catalogue) => {
  const jumpLandmarks = shallowRef<Landmark[]>([]);
  const domainEntranceLandmarks = shallowRef<DomainEntranceLandmark[]>([]);
  const unsettledRegionCount = shallowRef(catalogue.regions.length);
  for (const { id } of catalogue.regions)
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readRegionData(regionDataBaseUrl, id)).match(
      ({ landmarks }) => {
        jumpLandmarks.value = [
          ...jumpLandmarks.value,
          ...landmarks.filter(({ kind }) => JUMP_LANDMARK_KINDS.includes(kind)),
        ];
        domainEntranceLandmarks.value = [
          ...domainEntranceLandmarks.value,
          ...landmarks.filter(
            (landmark): landmark is DomainEntranceLandmark => landmark.kind === LandmarkKind.DomainEntrance,
          ),
        ];
        unsettledRegionCount.value -= 1;
      },
      (error) => {
        console.error(error);
        unsettledRegionCount.value -= 1;
      },
    );
  return { domainEntranceLandmarks, isLoaded: computed(() => unsettledRegionCount.value === 0), jumpLandmarks };
};
