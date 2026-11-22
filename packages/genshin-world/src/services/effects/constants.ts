import { ENEMY_CAPSULE_HEIGHT } from "#src/services/enemy/constants";

// Provisional: how long each stand-in effect shows, in seconds. Each is an estimate, not a measurement, until the held
// World attacks capture is read with `genshin:parity frames`
export const SPARK_SECONDS = 0.2;
export const DAMAGE_NUMBER_SECONDS = 0.8;
export const FLASH_SECONDS = 0.3;
// Provisional: how long an energy drop takes to fly from where its enemy fell to the member on the field
export const ENERGY_DROP_SECONDS = 0.6;
// Provisional: the height above the ground each effect is drawn at, the middle of an enemy's capsule, which a caster's
// Visual shares until a recording says otherwise
export const EFFECT_HEIGHT = ENEMY_CAPSULE_HEIGHT / 2;
