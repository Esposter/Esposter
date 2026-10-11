import { MaterialType } from "#src/models/inventory/MaterialType";
import { ItemCategory } from "genshin-interface";

// The tab each material type is filed in, as the wiki's item pages file it
export const MaterialTypeItemCategoryMap = {
  [MaterialType.CharacterDevelopmentMaterial]: ItemCategory.CharacterDevelopmentItem,
  [MaterialType.Consume]: ItemCategory.Material,
  [MaterialType.ElementalCrystal]: ItemCategory.Material,
  [MaterialType.Exchange]: ItemCategory.Material,
  [MaterialType.ExpFruit]: ItemCategory.CharacterDevelopmentItem,
  [MaterialType.FishBait]: ItemCategory.Material,
  [MaterialType.Flycloak]: ItemCategory.Furnishing,
  [MaterialType.Food]: ItemCategory.Food,
  [MaterialType.Namecard]: ItemCategory.Furnishing,
  [MaterialType.NoticeAddHp]: ItemCategory.Material,
  [MaterialType.WeaponExpStone]: ItemCategory.Material,
  [MaterialType.Widget]: ItemCategory.Material,
} as const satisfies Record<MaterialType, ItemCategory>;
