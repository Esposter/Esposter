// A material's type, spelt as the game's material table spells it. The enemies' masks are character development
// Materials and the enhancement ores weapon exp stones; the bench's potions and baits are food and fish bait, and the
// Gadgets it crafts widgets. The tab each is filed in is `MaterialTypeItemCategoryMap`'s
export enum MaterialType {
  CharacterDevelopmentMaterial = "MATERIAL_AVATAR_MATERIAL",
  Consume = "MATERIAL_CONSUME",
  ElementalCrystal = "MATERIAL_ELEM_CRYSTAL",
  Exchange = "MATERIAL_EXCHANGE",
  ExpFruit = "MATERIAL_EXP_FRUIT",
  FishBait = "MATERIAL_FISH_BAIT",
  Flycloak = "MATERIAL_FLYCLOAK",
  Food = "MATERIAL_FOOD",
  FurnitureFormula = "MATERIAL_FURNITURE_FORMULA",
  Namecard = "MATERIAL_NAMECARD",
  NoticeAddHp = "MATERIAL_NOTICE_ADD_HP",
  WeaponExpStone = "MATERIAL_WEAPON_EXP_STONE",
  Widget = "MATERIAL_WIDGET",
}
