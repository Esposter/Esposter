import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { GameTextKey } from "genshin-text";

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
// A pack's own files, named alike in every pack: its model, uploaded under this name, and the terms bundled with it.
// The model's textures keep the paths the model names them by
export const CHARACTER_MODEL_PATH = "model.pmx";
export const CHARACTER_TERMS_PATH = "terms.txt";
// A pack's terms are fetched on its own, and abandoned past this so a stalled request cannot hold the page's text back
export const CHARACTER_TERMS_FETCH_TIMEOUT_MS = 10_000;
// A model and each of its textures run to megabytes, and are abandoned past this so a stalled request cannot leave a
// Character loading for good
export const CHARACTER_MODEL_FETCH_TIMEOUT_MS = 60_000;
// The Traveler the world plays, the female twin, as the login's Traveler is
export const TRAVELER_CHARACTER_ID = 10_000_007;
// The characters whose kits are built on their own modules, by the avatar ids the game's tables give them
export const DILUC_CHARACTER_ID = 10_000_016;
export const BENNETT_CHARACTER_ID = 10_000_032;
export const MONA_CHARACTER_ID = 10_000_041;
export const AMBER_CHARACTER_ID = 10_000_021;
export const KAEYA_CHARACTER_ID = 10_000_025;
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
