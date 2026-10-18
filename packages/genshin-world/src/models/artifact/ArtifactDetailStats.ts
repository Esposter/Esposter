import type { AttributeDetailRow } from "#src/services/character/getAttributeDetailGroups";

// An artifact's stats in its panel: its main stat's name with its value, which is empty while the main affix's table is not
// Read, and each minor affix's name with its value, in the form the Details list writes them
export interface ArtifactDetailStats {
  mainStat: AttributeDetailRow;
  subStats: AttributeDetailRow[];
}
