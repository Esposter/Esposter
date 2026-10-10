import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { ArtifactSlot, Element } from "genshin-world";
import { join } from "node:path";

// The world package's generated folder, which holds the committed talent loader map
const GENERATED_DIRECTORY = join(REPOSITORY_ROOT, "packages", "genshin-world", "src", "generated");
// The folder of the committed loader map whose entries read each character's multipliers from the hosted index
export const TALENT_MULTIPLIER_GENERATED_DIRECTORY: string = join(GENERATED_DIRECTORY, "talentMultipliers");
// What a character's quality means in stars: the purple four, and the gold five, the crossover's gold among them
export const QualityTypeRarityMap: Readonly<Record<string, number>> = {
  QUALITY_ORANGE: 5,
  QUALITY_ORANGE_SP: 5,
  QUALITY_PURPLE: 4,
};
// The catalogue region each association the game files a character under names: a nation's own, and the Fatui
// Counted as Snezhnaya's, as the wiki counts them. Every other association, the Traveler's and a visitor's, names none
export const AssociationRegionIdMap: Readonly<Record<string, string>> = {
  ASSOC_TYPE_FATUI: "snezhnaya",
  ASSOC_TYPE_FONTAINE: "fontaine",
  ASSOC_TYPE_INAZUMA: "inazuma",
  ASSOC_TYPE_LIYUE: "liyue",
  ASSOC_TYPE_MONDSTADT: "mondstadt",
  ASSOC_TYPE_NATLAN: "natlan",
  ASSOC_TYPE_NODKRAI: "nod-krai",
  ASSOC_TYPE_SUMERU: "sumeru",
};
// The character table's playable characters, apart from its test and retired rows
export const PLAYABLE_AVATAR_USE_TYPE = "AVATAR_FORMAL";
// The property a table writes in a slot holding nothing
export const EMPTY_PROPERTY_TYPE = "FIGHT_PROP_NONE";
// The item id a slot holding nothing names: an unused cost slot of a phase, and a weapon refined by a copy alone
export const EMPTY_ITEM_ID = 0;
// The Traveler's two avatars, and the element their form is by default until a statue gives them another
export const TRAVELER_AVATAR_IDS: ReadonlySet<number> = new Set([10000005, 10000007]);
export const TRAVELER_DEFAULT_ELEMENT: Element = Element.Anemo;
// The last level a combat talent's materials raise it to. Each level past it is a constellation's, which no material pays for
export const MAX_MATERIAL_TALENT_LEVEL = 10;
// The seven elements as the game's tables spell them, which a skill's energy names and each character's element is read from
export const ElementNameSet: ReadonlySet<string> = new Set<string>(Object.values(Element));
// The depot each slot's standard pieces draw their main affix from, the depot holding that slot's own attributes
export const ArtifactSlotMainPropDepotMap: Readonly<Record<ArtifactSlot, number>> = {
  [ArtifactSlot.CircletOfLogos]: 3000,
  [ArtifactSlot.FlowerOfLife]: 4000,
  [ArtifactSlot.GobletOfEonothem]: 5000,
  [ArtifactSlot.PlumeOfDeath]: 2000,
  [ArtifactSlot.SandsOfEon]: 1000,
};
// The depot each rarity's standard pieces draw their minor affixes from, the others being the events' and bosses' own
export const ArtifactRarityAffixDepotMap: ReadonlyMap<number, number> = new Map([
  [1, 101],
  [2, 201],
  [3, 301],
  [4, 401],
  [5, 501],
]);
// The item use that adds EXP to an artifact, its first parameter the EXP one of the item gives
export const ARTIFACT_EXP_ITEM_USE = "ITEM_USE_ADD_RELIQUARY_EXP";
// The dump's talent configs, one file for each group of characters, each a map from a talent's config name to its actions
export const TALENT_CONFIG_DIRECTORY: string = join(GAME_TEXT_DIRECTORY, "BinOutput", "Talent", "AvatarTalents");
// The last digit of a skill's proud skill group is the slot a constellation names the skill by: 1 the normal attack, 2 the
// Elemental Skill and 9 the burst, as the dump numbers them
export const PROUD_SKILL_SLOT_MODULUS = 10;
