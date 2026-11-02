import type { Seelie } from "#src/models/puzzle/Seelie";
import type { RegionData } from "#src/models/world/RegionData";
import type { GroundPoint } from "genshin-engine";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { computeQuestClueTrailEnds } from "#src/services/elementalSight/computeQuestClueTrailEnds";

interface SightTrailEndsOptions {
  // The spots of the bounties' targets standing in the world, which the sight leads a trail to while it is on
  getBountyTrailEnds: () => GroundPoint[];
  // The targets the quests in progress name at their current steps, which the sight leads trails to while it is on
  getQuestClueTargetIds: () => string[];
  // The Seelies of Mondstadt, whose courts the sight leads a trail to while each rests
  getSeelies: () => Seelie[];
  // The regions in reach, whose placed go-to places the quests' clues lead to
  regionDataMap: ReadonlyMap<string, RegionData>;
}

// The ends the sight's trails lead to: the courts of the Seelies still resting, the bounties' targets standing, and the
// Go-to places the quests' clues name
export const useSightTrailEnds = ({
  getBountyTrailEnds,
  getQuestClueTargetIds,
  getSeelies,
  regionDataMap,
}: SightTrailEndsOptions) => {
  // The courts of the Seelies still resting, which the sight leads a trail to while it is on
  const seelieCourts = computed(() =>
    getSeelies()
      .filter(({ state }) => state === SeelieState.Resting)
      .map(({ court }) => court),
  );
  // The go-to places the quests' clues name, which the sight leads a trail to once each is placed in the region data
  const questClueTrailEnds = computed(() => computeQuestClueTrailEnds(regionDataMap, getQuestClueTargetIds()));
  return computed(() => [...seelieCourts.value, ...getBountyTrailEnds(), ...questClueTrailEnds.value]);
};
