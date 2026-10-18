import type { AttributeDetailRow } from "#src/services/character/getAttributeDetailGroups";

// An artifact's stats in its panel: its main stat's name with its value, each minor affix's name with its value, in the
// Form the Details list writes them, and whether the artifact is locked, which keeps it out of fodder
export interface ArtifactDetailStats {
  isLocked: boolean;
  mainStat: AttributeDetailRow;
  subStats: AttributeDetailRow[];
}
