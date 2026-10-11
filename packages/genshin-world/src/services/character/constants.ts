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
// The listing beside the characters' folders of the ids a host holds a pack for, so a character with none is drawn as
// Its capsule without a request of its own
export const CHARACTER_PACK_INDEX_PATH = "index.json";
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
// A pack's terms are fetched on its own, and abandoned past this so a stalled request cannot hold the page's text back
export const CHARACTER_TERMS_FETCH_TIMEOUT_MS = 10_000;
// A model and each of its textures run to megabytes, and are abandoned past this so a stalled request cannot leave a
// Character loading for good
export const CHARACTER_MODEL_FETCH_TIMEOUT_MS = 60_000;
// The Traveler the world plays, the female twin, as the login's Traveler is
export const TRAVELER_CHARACTER_ID = 10_000_007;
// The characters whose kits are built on their own modules, by the avatar ids the game's tables give them
export const DILUC_CHARACTER_ID = 10_000_016;
export const FISCHL_CHARACTER_ID = 10_000_031;
export const BENNETT_CHARACTER_ID = 10_000_032;
export const MONA_CHARACTER_ID = 10_000_041;
export const AMBER_CHARACTER_ID = 10_000_021;
export const KAEYA_CHARACTER_ID = 10_000_015;
export const LISA_CHARACTER_ID = 10_000_006;
export const NOELLE_CHARACTER_ID = 10_000_034;
export const AYAKA_CHARACTER_ID = 10_000_002;
export const JEAN_CHARACTER_ID = 10_000_003;
export const BARBARA_CHARACTER_ID = 10_000_014;
export const RAZOR_CHARACTER_ID = 10_000_020;
export const VENTI_CHARACTER_ID = 10_000_022;
export const XIANGLING_CHARACTER_ID = 10_000_023;
export const BEIDOU_CHARACTER_ID = 10_000_024;
export const XINGQIU_CHARACTER_ID = 10_000_025;
export const XIAO_CHARACTER_ID = 10_000_026;
export const NINGGUANG_CHARACTER_ID = 10_000_027;
export const KLEE_CHARACTER_ID = 10_000_029;
export const ZHONGLI_CHARACTER_ID = 10_000_030;
export const QIQI_CHARACTER_ID = 10_000_035;
export const CHONGYUN_CHARACTER_ID = 10_000_036;
// The Attributes tab's advanced attributes and the game's name for each, in the order its details list them
export const ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS: readonly (readonly [Attribute, GameTextKey])[] = [
  [Attribute.CriticalRate, GameTextKey.AttributeCriticalRate],
  [Attribute.CriticalDamage, GameTextKey.AttributeCriticalDamage],
  [Attribute.HealingBonus, GameTextKey.AttributeHealingBonus],
  [Attribute.EnergyRecharge, GameTextKey.AttributeEnergyRecharge],
];
// The Attributes tab's damage bonuses and the game's name for each, in the order its details list them
export const ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS: readonly (readonly [Attribute, GameTextKey])[] = [
  [Attribute.PyroDamageBonus, GameTextKey.AttributePyroDamageBonus],
  [Attribute.HydroDamageBonus, GameTextKey.AttributeHydroDamageBonus],
  [Attribute.DendroDamageBonus, GameTextKey.AttributeDendroDamageBonus],
  [Attribute.ElectroDamageBonus, GameTextKey.AttributeElectroDamageBonus],
  [Attribute.AnemoDamageBonus, GameTextKey.AttributeAnemoDamageBonus],
  [Attribute.CryoDamageBonus, GameTextKey.AttributeCryoDamageBonus],
  [Attribute.GeoDamageBonus, GameTextKey.AttributeGeoDamageBonus],
  [Attribute.PhysicalDamageBonus, GameTextKey.AttributePhysicalDamageBonus],
];
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
