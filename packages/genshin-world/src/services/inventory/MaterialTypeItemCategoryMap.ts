import { MaterialType } from "#src/models/inventory/MaterialType";
import { ItemCategory } from "genshin-interface";

// The tab each material type is filed in, as the wiki's item pages give its inventory category. The game files a wind
// Glider and a namecard in no tab, keeping them in its attire and namecard collections, which are not built, so until
// Then both stand among the Precious Items, a tab counted by kind. The game files the enhancement ores among the
// Weapons, but every entry of that tab here is a weapon of its own at a level, so the ores stay among the Materials
export const MaterialTypeItemCategoryMap = {
  [MaterialType.CharacterDevelopmentMaterial]: ItemCategory.CharacterDevelopmentItem,
  [MaterialType.Consume]: ItemCategory.PreciousItem,
  [MaterialType.ElementalCrystal]: ItemCategory.PreciousItem,
  [MaterialType.Exchange]: ItemCategory.Material,
  [MaterialType.ExpFruit]: ItemCategory.CharacterDevelopmentItem,
  [MaterialType.FishBait]: ItemCategory.Material,
  [MaterialType.Flycloak]: ItemCategory.PreciousItem,
  [MaterialType.Food]: ItemCategory.Food,
  // A furniture formula is the blueprint of a furnishing, filed with the furnishings. The wiki gives the furnishing's
  // Category rather than the formula's tab, so this filing is provisional until a recording confirms it
  [MaterialType.FurnitureFormula]: ItemCategory.Furnishing,
  [MaterialType.Namecard]: ItemCategory.PreciousItem,
  [MaterialType.NoticeAddHp]: ItemCategory.Food,
  // The material table files a talent material on no bag page, so the bag holds it and draws it in no tab
  [MaterialType.Talent]: undefined,
  [MaterialType.WeaponExpStone]: ItemCategory.Material,
  [MaterialType.Widget]: ItemCategory.Gadget,
} as const satisfies Record<MaterialType, ItemCategory | undefined>;
