import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinChange } from "#src/models/genshinProgress/GenshinChange";
import type { GenshinRoadmapReading } from "#src/models/genshinProgress/GenshinRoadmapReading";

// Everything the report counts, each source read once: the compute pages, the Genshin changes and the roadmap
export interface GenshinUnits {
  areas: GenshinArea[];
  changes: GenshinChange[];
  roadmap: GenshinRoadmapReading;
}
