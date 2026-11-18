import { ENEMY_CAPSULE_HEIGHT } from "#src/services/enemy/constants";

// Provisional: how long each stand-in effect shows, until task 1.1 reads them off the held world attacks capture
export const SPARK_SECONDS = 0.2;
export const DAMAGE_NUMBER_SECONDS = 0.8;
export const FLASH_SECONDS = 0.3;
// Provisional: the height above the ground each effect is drawn at, the middle of an enemy's capsule, which a caster's
// Visual shares until a recording says otherwise
export const EFFECT_HEIGHT = ENEMY_CAPSULE_HEIGHT / 2;
