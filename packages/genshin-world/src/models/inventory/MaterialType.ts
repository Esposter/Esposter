// A material's type, spelt as the game's material table spells it. The enemies' masks are character development
// Materials, the type the bag files among its Character Development Items. The enhancement ores are weapon exp stones,
// Which the bag files among its Materials, and the bench's potions and baits are food and fish bait. The gadgets the
// Bench crafts are widgets, which the bag files among its Materials too
export enum MaterialType {
  CharacterDevelopmentMaterial = "MATERIAL_AVATAR_MATERIAL",
  Consume = "MATERIAL_CONSUME",
  Exchange = "MATERIAL_EXCHANGE",
  FishBait = "MATERIAL_FISH_BAIT",
  Food = "MATERIAL_FOOD",
  NoticeAddHp = "MATERIAL_NOTICE_ADD_HP",
  WeaponExpStone = "MATERIAL_WEAPON_EXP_STONE",
  Widget = "MATERIAL_WIDGET",
}
