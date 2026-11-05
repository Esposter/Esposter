import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { GenshinProgressKind } from "#src/models/genshinProgress/GenshinProgressKind";

// The Genshin roadmap, whose phase headings group every open item and name each phase
export const GENSHIN_ROADMAP_FILE = "openspec/changes/genshin-roadmap/tasks.md";
// The order the report's rows read in: the compute kinds, then the change and the roadmap item
export const GENSHIN_ROW_KINDS: readonly (ComputeKind | GenshinProgressKind)[] = [
  ...Object.values(ComputeKind),
  ...Object.values(GenshinProgressKind),
];
// The header over each phase's table of rows
export const GENSHIN_PHASE_HEADER: readonly string[] = [
  "kind",
  "units",
  "done",
  "runnable here",
  "waiting",
  "blocked on the other machine",
  "first blocker",
];
// The most characters of a first blocker a table row prints, its full words being on the unit's own line
export const GENSHIN_BLOCKER_WIDTH = 100;
