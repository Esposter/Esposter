import type { TowerBuffIcon } from "#src/models/genshinAssets/spiralAbyss/TowerBuffIcon";
import type { TowerBuffLastingType } from "#src/models/genshinAssets/spiralAbyss/TowerBuffLastingType";

// The fields read off one row of the game's tower buff table: a Benediction's id, its description's text hash,
// The icon its card is drawn with and the lasting type it is chosen with
export interface ExcelTowerBuffRow {
  buffIcon: TowerBuffIcon;
  descTextMapHash: number;
  lastingType: TowerBuffLastingType;
  towerBuffId: number;
}
