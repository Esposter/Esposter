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
export const TARTAGLIA_CHARACTER_ID = 10_000_033;
export const GANYU_CHARACTER_ID = 10_000_037;
export const GOROU_CHARACTER_ID = 10_000_055;
export const ALBEDO_CHARACTER_ID = 10_000_038;
export const DIONA_CHARACTER_ID = 10_000_039;
export const KEQING_CHARACTER_ID = 10_000_042;
export const KUJOU_SARA_CHARACTER_ID = 10_000_056;
export const SUCROSE_CHARACTER_ID = 10_000_043;
export const XINYAN_CHARACTER_ID = 10_000_044;
export const ROSARIA_CHARACTER_ID = 10_000_045;
export const HU_TAO_CHARACTER_ID = 10_000_046;
export const KAZUHA_CHARACTER_ID = 10_000_047;
export const YANFEI_CHARACTER_ID = 10_000_048;
export const YOIMIYA_CHARACTER_ID = 10_000_049;
export const THOMA_CHARACTER_ID = 10_000_050;
export const SAYU_CHARACTER_ID = 10_000_053;
export const KOKOMI_CHARACTER_ID = 10_000_054;
export const EULA_CHARACTER_ID = 10_000_051;
export const RAIDEN_CHARACTER_ID = 10_000_052;
export const YELAN_CHARACTER_ID = 10_000_060;
export const KIRARA_CHARACTER_ID = 10_000_061;
export const ALOY_CHARACTER_ID = 10_000_062;
export const SHENHE_CHARACTER_ID = 10_000_063;
export const YUNJIN_CHARACTER_ID = 10_000_064;
export const ITTO_CHARACTER_ID = 10_000_057;
export const HEIZOU_CHARACTER_ID = 10_000_059;
export const YAE_MIKO_CHARACTER_ID = 10_000_058;
export const KUKI_CHARACTER_ID = 10_000_065;
export const AYATO_CHARACTER_ID = 10_000_066;
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
