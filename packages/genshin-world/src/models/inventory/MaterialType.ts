// A material's type, spelt as the game's material table spells it. The enemies' masks are character development
// Materials, the type the bag files among its Character Development Items. The enhancement ores are weapon exp stones,
// Which the bag files among its Materials, and the bench's potions and baits are food and fish bait. The gadgets the
// Bench crafts are widgets, which the bag files among its Materials too
export enum MaterialType {
  CharacterDevelopmentMaterial = "MATERIAL_AVATAR_MATERIAL",
  Consume = "MATERIAL_CONSUME",
  ElementalCrystal = "MATERIAL_ELEM_CRYSTAL",
  Exchange = "MATERIAL_EXCHANGE",
  ExpFruit = "MATERIAL_EXP_FRUIT",
  FishBait = "MATERIAL_FISH_BAIT",
  Flycloak = "MATERIAL_FLYCLOAK",
  Food = "MATERIAL_FOOD",
  Namecard = "MATERIAL_NAMECARD",
  NoticeAddHp = "MATERIAL_NOTICE_ADD_HP",
  WeaponExpStone = "MATERIAL_WEAPON_EXP_STONE",
  Widget = "MATERIAL_WIDGET",
}
