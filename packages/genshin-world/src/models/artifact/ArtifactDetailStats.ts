import type { AttributeDetailRow } from "#src/services/character/getAttributeDetailGroups";

// An artifact's stats in its panel: its main stat's name with its value, and each minor affix's name with its value, in
// The form the Details list writes them
export interface ArtifactDetailStats {
  mainStat: AttributeDetailRow;
  subStats: AttributeDetailRow[];
}
