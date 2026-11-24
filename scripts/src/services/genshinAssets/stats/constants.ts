import { AssociationRegionId } from "#src/models/genshinAssets/stats/AssociationRegionId";
import { QualityTypeRarity } from "#src/models/genshinAssets/stats/QualityTypeRarity";
import { AVATAR_TALENT_DIRECTORY, GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { DestroyRule, Element, GameDataset, WeaponType } from "genshin-world";
import { join } from "node:path";

// The world package's generated folder, which holds the committed loader maps
export const WORLD_GENERATED_DIRECTORY: string = join(REPOSITORY_ROOT, "packages", "genshin-world", "src", "generated");
// The folder of the committed loader map whose entries read each character's multipliers from the hosted index
export const TALENT_MULTIPLIER_GENERATED_DIRECTORY: string = join(
  WORLD_GENERATED_DIRECTORY,
  GameDataset.TalentMultipliers,
);
// What a character's quality means in stars: the purple four, and the gold five, the crossover's gold among them
export const QualityTypeRarityMap: Readonly<Record<string, number>> = {
  [QualityTypeRarity.QualityOrange]: 5,
  [QualityTypeRarity.QualityOrangeSp]: 5,
  [QualityTypeRarity.QualityPurple]: 4,
};
// The catalogue region each association the game files a character under names: a nation's own, and the Fatui and
// Snezhnaya's two associations counted as Snezhnaya's, as the wiki counts the Fatui. Every other association, the
// Traveler's and a visitor's, names none
export const AssociationRegionIdMap: Readonly<Record<string, string>> = {
  [AssociationRegionId.AssociationTypeFatui]: "snezhnaya",
  [AssociationRegionId.AssociationTypeFontaine]: "fontaine",
  [AssociationRegionId.AssociationTypeInazuma]: "inazuma",
  [AssociationRegionId.AssociationTypeLiyue]: "liyue",
  [AssociationRegionId.AssociationTypeMondstadt]: "mondstadt",
  [AssociationRegionId.AssociationTypeNatlan]: "natlan",
  [AssociationRegionId.AssociationTypeNodkrai]: "nod-krai",
  [AssociationRegionId.AssociationTypeSnezhnaya]: "snezhnaya",
  [AssociationRegionId.AssociationTypeSnezhnayaStar]: "snezhnaya",
  [AssociationRegionId.AssociationTypeSumeru]: "sumeru",
};
// The character table's playable characters, apart from its test and retired rows
export const PLAYABLE_AVATAR_USE_TYPE = "AVATAR_FORMAL";
// The property a table leaves out, its first value, in a slot holding nothing
export const EMPTY_PROPERTY_TYPE = "FIGHT_PROP_NONE";
// The destroy rule a weapon the table leaves out holds, the first of its enum
export const DEFAULT_DESTROY_RULE: DestroyRule = DestroyRule.None;
// The item id a slot holding nothing names: an unused cost slot of a phase, and a weapon refined by a copy alone
export const EMPTY_ITEM_ID = 0;
// The Traveler's two avatars, and the element their form is by default until a statue gives them another
export const TRAVELER_AVATAR_IDS: ReadonlySet<number> = new Set([10000005, 10000007]);
export const TRAVELER_DEFAULT_ELEMENT: Element = Element.Anemo;
// The last level a combat talent's materials raise it to. Each level past it is a constellation's, which no material
// Pays for
export const MAX_MATERIAL_TALENT_LEVEL = 10;
// The seven elements as the game's tables spell them, which a skill's energy names and each character's element is read
// From
export const ElementNameSet: ReadonlySet<string> = new Set<string>(Object.values(Element));
// The five kinds of weapon the open world gives a character, as the game's tables spell them. The tables hold a sixth,
// The crossbow, wielded only by the Traveler's discarded shooter forms, so a character or weapon of it is no one's to
// Play
export const WeaponTypeNameSet: ReadonlySet<string> = new Set<string>(Object.values(WeaponType));
// The depot each rarity's standard pieces draw their minor affixes from, the others being the events' and bosses' own
export const ArtifactRarityAffixDepotMap: ReadonlyMap<number, number> = new Map([
  [1, 101],
  [2, 201],
  [3, 301],
  [4, 401],
  [5, 501],
]);
// The item uses that add EXP to an artifact, a character and a weapon, their first parameter the EXP one of the item
// Gives
export const ARTIFACT_EXP_ITEM_USE = "ITEM_USE_ADD_RELIQUARY_EXP";
export const CHARACTER_EXP_ITEM_USE = "ITEM_USE_ADD_EXP";
export const WEAPON_EXP_ITEM_USE = "ITEM_USE_ADD_WEAPON_EXP";
// The game's character levelling table, and its extra-level table of the lifts past a level cap
export const AVATAR_LEVEL_TABLE_NAME = "AvatarLevelExcelConfigData";
export const AVATAR_EXTRA_LEVEL_TABLE_NAME = "AvatarExtraLevelExcelConfigData";
// The dump's talent configs, one file for each group of characters, each a map from a talent's config name to its
// Actions
export const TALENT_CONFIG_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, AVATAR_TALENT_DIRECTORY);
// The last digit of a skill's proud skill group is the slot a constellation names the skill by: 1 the normal attack, 2
// The Elemental Skill and 9 the burst, as the dump numbers them
export const PROUD_SKILL_SLOT_MODULUS = 10;
// The game's constant table row holding the Original Resin constants, in the order its values give them
export const RESIN_PARAM_CONST_NAME = "CONST_VALUE_RESIN_PARAM";
// The game's constant names of the item limits the bag counts each tab on its own by, the first value of each row its
// Room
export const ARTIFACT_ROOM_CONST_NAME = "CONST_VALUE_RELIQUARY_ITEM_LIMIT";
export const FURNISHING_ROOM_CONST_NAME = "CONST_VALUE_FURNITURE_ITEM_LIMIT";
export const WEAPON_ROOM_CONST_NAME = "CONST_VALUE_WEAPON_ITEM_LIMIT";
