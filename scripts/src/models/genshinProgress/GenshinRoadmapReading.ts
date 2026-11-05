import type { GenshinRoadmapItem } from "#src/models/genshinProgress/GenshinRoadmapItem";

// The roadmap's items, and the name each phase heading gives its phase
export interface GenshinRoadmapReading {
  items: GenshinRoadmapItem[];
  names: Map<number, string>;
}
