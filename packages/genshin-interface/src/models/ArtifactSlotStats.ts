import type { ArtifactStatLine } from "#src/models/ArtifactStatLine";

// A worn artifact's stats: its main stat with its value, its minor affixes, and whether it is locked
export interface ArtifactSlotStats {
  isLocked: boolean;
  mainStat: ArtifactStatLine;
  subStats: ArtifactStatLine[];
}
