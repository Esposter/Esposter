import type { GenshinProgress } from "#src/models/genshinProgress/GenshinProgress";
import type { GenshinUnit } from "#src/models/genshinProgress/GenshinUnit";
import type { GenshinUnits } from "#src/models/genshinProgress/GenshinUnits";

import { MAX_GENSHIN_PHASE } from "#src/services/fleet/constants";
import { getAreaUnit } from "#src/services/genshinProgress/getAreaUnit";
import { getChangeUnits } from "#src/services/genshinProgress/getChangeUnits";
import { getPhaseChecks } from "#src/services/genshinProgress/getPhaseChecks";
import { getPhaseRows } from "#src/services/genshinProgress/getPhaseRows";
import { getRoadmapUnit } from "#src/services/genshinProgress/getRoadmapUnit";

// Every phase from 0 to the last Genshin phase, with its units by kind and state for this machine's capabilities, and its
// Exit checks. A unit that holds no phase is counted apart, so none drops out of the report
export const buildGenshinProgress = (units: GenshinUnits, capabilities: readonly string[]): GenshinProgress => {
  const counted: GenshinUnit[] = [
    ...units.areas.map((area) => getAreaUnit(area, capabilities)),
    ...units.changes.flatMap((change) => getChangeUnits(change, capabilities)),
    ...units.roadmap.items.map((item) => getRoadmapUnit(item, units.scriptedQuests)),
  ];
  const placed = counted.filter(({ phase }) => phase !== undefined);
  return {
    phases: Array.from({ length: MAX_GENSHIN_PHASE + 1 }, (_phase, phase) => ({
      checks: getPhaseChecks(phase, units.areas, units.exit),
      name: units.roadmap.names.get(phase) ?? "",
      phase,
      rows: getPhaseRows(placed.filter((unit) => unit.phase === phase)),
    })),
    unphased: counted.length - placed.length,
  };
};
