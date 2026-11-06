import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinChange } from "#src/models/genshinProgress/GenshinChange";
import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";
import type { GenshinRoadmapReading } from "#src/models/genshinProgress/GenshinRoadmapReading";

// Everything the report counts and every reading its exit checks take, each source read once: the compute pages, the
// Genshin changes, the roadmap and the parity and game data files
export interface GenshinUnits {
  areas: GenshinArea[];
  changes: GenshinChange[];
  exit: GenshinExitReadings;
  roadmap: GenshinRoadmapReading;
}
