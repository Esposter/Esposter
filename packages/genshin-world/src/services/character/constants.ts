import type { TalentLevels } from "#src/models/character/TalentLevels";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { GameLanguage, GameTextKey } from "genshin-text";

// The game's order of the five artifact slots, and of the three combat talents, which the tabs list them in
export const ARTIFACT_SLOT_ORDER = [
  ArtifactSlot.FlowerOfLife,
  ArtifactSlot.PlumeOfDeath,
  ArtifactSlot.SandsOfEon,
  ArtifactSlot.GobletOfEonothem,
  ArtifactSlot.CircletOfLogos,
];
export const COMBAT_TALENT_ORDER = [
  CombatTalent.NormalAttack,
  CombatTalent.ElementalSkill,
  CombatTalent.ElementalBurst,
];
// The level every combat talent starts at, before any upgrade raises it
export const TALENT_START_LEVEL = 1;
export const TALENT_START_LEVELS: TalentLevels = {
  [CombatTalent.ElementalBurst]: TALENT_START_LEVEL,
  [CombatTalent.ElementalSkill]: TALENT_START_LEVEL,
  [CombatTalent.NormalAttack]: TALENT_START_LEVEL,
};
// The listing beside the characters' folders of the ids a host holds a pack for, so a character with none is drawn as
// Its capsule without a request of its own, and of the packs the browser keeps
export const CHARACTER_PACK_INDEX_PATH = "index.json";
// Where the browser keeps the packs a player loads: the private file system's folder, or the IndexedDB database and its
// One store, each file under its character's id and its pack's hash
export const CHARACTER_PACK_STORE_NAME = "genshin-character-packs";
export const CHARACTER_PACK_STORE_FILES_NAME = "files";
export const CHARACTER_PACK_STORE_VERSION = 1;
// The folder macOS's archiver adds to a zip for each file's resource fork, a "._" file beside the file's own name
export const MACOS_RESOURCE_FORK_FOLDER = "__MACOSX/";
// A pack's own files, named alike in every pack whatever its folder calls them: its model, and the terms bundled with
// It as UTF-8. The model's textures keep the paths the model names them by
export const CHARACTER_MODEL_PATH = "model.pmx";
export const CHARACTER_TERMS_PATH = "terms.txt";
// What a pack's terms file is found by in its name, the earliest preferred where several match: the Japanese terms, the
// Readme they are often bundled in, the Chinese instructions, terms and rules, and an English name
export const CHARACTER_TERMS_FILE_NAMES: readonly string[] = [
  "利用規約",
  "readme",
  "使用说明",
  "规约",
  "规则",
  "terms",
];
// What a Shift-JIS reading of Chinese text turns up and Japanese terms never hold: the half-width katakana a GBK lead
// Byte reads as, and the private-use letters its highest lead bytes map to
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const CHARACTER_TERMS_NOT_JAPANESE_REGEX: RegExp = /[\uE000-\uF8FF\uFF61-\uFF9F]/u;
// The languages the official packs name their models in, which a folder of several models is matched to its character
// By: the Chinese and English names the packs carry, and the Japanese of MMD's own convention
export const CHARACTER_PACK_MODEL_NAME_LANGUAGES: readonly GameLanguage[] = [
  GameLanguage.ChineseSimplified,
  GameLanguage.English,
  GameLanguage.Japanese,
];
// A file of a host's pack, its model and each of its textures running to megabytes, is abandoned past this so a stalled
// Request cannot leave a character loading for good
export const CHARACTER_PACK_FETCH_TIMEOUT_MS = 60_000;
// The Traveler the world plays, the female twin, as the login's Traveler is
export const TRAVELER_CHARACTER_ID = 10_000_007;
// MMD's unit in metres as its community reckons it, eight centimetres, held by every character whose game model is not
// Measured yet, so it stands as tall in the world as it does in MMD. Provisional until each character's is measured
export const CHARACTER_PMX_RECKONED_UNIT_METRES = 0.08;
// The metres a character's PMX unit stands for, by character id, where the game's own model is measured: the model's height
// Over the PMX's height in units. The Traveler's is measured, 1.5667 metres over 17.2332 units. A character not listed keeps
// The reckoned unit
export const CHARACTER_PMX_UNIT_METRES: ReadonlyMap<number, number> = new Map([[TRAVELER_CHARACTER_ID, 0.0909]]);
// The main quest whose completion unlocks the Traveler's bonus for each element it holds, Welkin Moon's Homecoming
export const TRAVELER_BONUS_QUEST_ID = 6017;
// The Attributes tab's base attributes, the Details list's first group, and the game's name for each, in the order it lists them
export const BASE_ATTRIBUTE_GAME_TEXT_KEYS: readonly (readonly [Attribute, GameTextKey])[] = [
  [Attribute.BaseHealth, GameTextKey.AttributeBaseHealth],
  [Attribute.BaseAttack, GameTextKey.AttributeBaseAttack],
  [Attribute.BaseDefense, GameTextKey.AttributeBaseDefense],
];
// The Attributes tab's advanced attributes and the game's name for each, in the order its details list them
export const ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS: readonly (readonly [Attribute, GameTextKey])[] = [
  [Attribute.CriticalRate, GameTextKey.AttributeCriticalRate],
  [Attribute.CriticalDamage, GameTextKey.AttributeCriticalDamage],
  [Attribute.HealingBonus, GameTextKey.AttributeHealingBonus],
  [Attribute.IncomingHealingBonus, GameTextKey.AttributeIncomingHealingBonus],
  [Attribute.EnergyRecharge, GameTextKey.AttributeEnergyRecharge],
  [Attribute.CooldownReduction, GameTextKey.AttributeCooldownReduction],
  [Attribute.ShieldStrength, GameTextKey.AttributeShieldStrength],
];
// The Attributes tab's damage bonuses and resistances and the game's name for each, in the order its details list them
export const ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS: readonly (readonly [Attribute, GameTextKey])[] = [
  [Attribute.PyroDamageBonus, GameTextKey.AttributePyroDamageBonus],
  [Attribute.HydroDamageBonus, GameTextKey.AttributeHydroDamageBonus],
  [Attribute.DendroDamageBonus, GameTextKey.AttributeDendroDamageBonus],
  [Attribute.ElectroDamageBonus, GameTextKey.AttributeElectroDamageBonus],
  [Attribute.AnemoDamageBonus, GameTextKey.AttributeAnemoDamageBonus],
  [Attribute.CryoDamageBonus, GameTextKey.AttributeCryoDamageBonus],
  [Attribute.GeoDamageBonus, GameTextKey.AttributeGeoDamageBonus],
  [Attribute.PhysicalDamageBonus, GameTextKey.AttributePhysicalDamageBonus],
  [Attribute.PyroResistance, GameTextKey.AttributePyroResistance],
  [Attribute.HydroResistance, GameTextKey.AttributeHydroResistance],
  [Attribute.DendroResistance, GameTextKey.AttributeDendroResistance],
  [Attribute.ElectroResistance, GameTextKey.AttributeElectroResistance],
  [Attribute.AnemoResistance, GameTextKey.AttributeAnemoResistance],
  [Attribute.CryoResistance, GameTextKey.AttributeCryoResistance],
  [Attribute.GeoResistance, GameTextKey.AttributeGeoResistance],
  [Attribute.PhysicalResistance, GameTextKey.AttributePhysicalResistance],
];
// The Masterless Stella Fortuna, the item that lifts a character past its level cap of 90
export const MASTERLESS_STELLA_FORTUNA_ID = 104_300;
// The level a Masterless Stella Fortuna lifts a character to from the level before, and how many it takes: one for
// The seventh ascension and two for the eighth, as the wiki's Character page gives them. Provisional until the
// Game's own table is published with the stats
export const MASTERLESS_LEVEL_LIFTS: ReadonlyMap<number, { count: number; level: number }> = new Map([
  [90, { count: 1, level: 95 }],
  [95, { count: 2, level: 100 }],
]);
// The Character EXP materials, each by the EXP it gives, the largest first: the Hero's Wit, the Adventurer's
// Experience and the Wanderer's Advice, under the ids the game's tables give them
export const CHARACTER_EXP_MATERIALS: readonly { exp: number; id: number }[] = [
  { exp: 20_000, id: 104_003 },
  { exp: 5000, id: 104_002 },
  { exp: 1000, id: 104_001 },
];
// The Character EXP a point of Mora pays for: five EXP for each Mora the wiki's Character EXP page charges
export const CHARACTER_EXP_PER_MORA = 5;
// The attributes the game writes whole rather than as a percentage: the bases, the flats and Elemental Mastery
export const WHOLE_ATTRIBUTES: readonly Attribute[] = [
  Attribute.BaseAttack,
  Attribute.BaseDefense,
  Attribute.BaseHealth,
  Attribute.Attack,
  Attribute.Defense,
  Attribute.Health,
  Attribute.ElementalMastery,
];
