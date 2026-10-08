import { EnemyState } from "#src/models/enemy/EnemyState";

// Enemies move in fixed steps of a sixtieth of a second, so their motion is the same at any frame rate
export const ENEMY_STEP_SECONDS = 1 / 60;
// Provisional: how near an idle enemy notices its target, and how long it stays alert before giving chase, in metres
// And seconds, measured off a recording of the player walking up to a hilichurl camp
export const ENEMY_AGGRO_RANGE = 12;
export const ENEMY_ALERT_SECONDS = 1;
// Provisional: how fast an enemy walks its patrol and runs a chase or home, in metres a second, measured off the
// Hilichurl's locomotion clips' root motion
export const ENEMY_WALK_SPEED = 1.5;
export const ENEMY_RUN_SPEED = 4;
// Provisional: how near an enemy starts an attack and how far its strike reaches, in metres, and its windup, recovery
// And the wait before its next attack, in seconds, measured off the Hilichurl's attack clips
export const ENEMY_ATTACK_RANGE = 2;
export const ENEMY_ATTACK_REACH = 2.5;
export const ENEMY_WINDUP_SECONDS = 0.8;
export const ENEMY_RECOVERY_SECONDS = 1;
export const ENEMY_ATTACK_COOLDOWN_SECONDS = 2;
// Provisional: how far from its spawn an enemy follows before it gives up and walks home, in metres, measured off a
// Recording of the player leading a hilichurl away from its camp
export const ENEMY_LEASH_DISTANCE = 30;
// Provisional: how long a stagger holds an enemy, and how long its body stays after its death before it drops its loot
// And is gone, in seconds, measured off the Hilichurl's hit and death clips
export const ENEMY_STAGGER_SECONDS = 0.5;
export const ENEMY_DEATH_SECONDS = 2;
// How near a point an enemy walking to it has arrived, in metres
export const ENEMY_ARRIVAL_DISTANCE = 0.1;
// The states in which an enemy is fighting, so its idle camp-mates are woken
export const ENGAGED_ENEMY_STATES: EnemyState[] = [
  EnemyState.Alert,
  EnemyState.Chase,
  EnemyState.Recovery,
  EnemyState.Stagger,
  EnemyState.Windup,
];
// A common enemy comes back this long after its defeat, and a camp with an elite at the next daily reset, at this
// Time of the reader's own day, since the world has no server whose time zone sets it
export const COMMON_ENEMY_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 12 });
export const DAILY_RESET_TIME: Temporal.PlainTime = Temporal.PlainTime.from({ hour: 4 });
// Drops are set by an enemy's level band, five levels wide, the last band holding every level from 90
export const ENEMY_LEVEL_BAND_SIZE = 5;
export const ENEMY_LEVEL_BAND_COUNT = 19;
// The share of a family's base Mora a common enemy drops in each level band, the least and the most, its drop a random
// Amount between them; an elite drops its band's one share
export const COMMON_ENEMY_MORA_SHARES: [number, number][] = [
  [0.4375, 0.65625],
  [0.5, 0.75],
  [0.5625, 0.875],
  [0.625, 0.9375],
  [0.6875, 1.03125],
  [0.75, 1.125],
  [0.8125, 1.21875],
  [0.84375, 1.28125],
  [0.90625, 1.34375],
  [0.90625, 1.375],
  [0.9375, 1.40625],
  [0.96875, 1.46875],
  [1, 1.53125],
  [1, 1.53125],
  [1, 1.53125],
  [1, 1.53125],
  [1, 1.53125],
  [1, 1.53125],
  [1, 1.53125],
];
export const ELITE_ENEMY_MORA_SHARES: number[] = [
  0.425, 0.5, 0.55, 0.6, 0.675, 0.725, 0.8, 0.825, 0.875, 0.9, 0.925, 0.975, 1, 1, 1, 1, 1, 1, 1,
];
// The Character EXP a common and an elite enemy give the party in each level band
export const COMMON_ENEMY_CHARACTER_EXPERIENCES: number[] = [
  10, 10, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20,
];
export const ELITE_ENEMY_CHARACTER_EXPERIENCES: number[] = [
  30, 31, 33, 35, 36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 58, 60,
];
// The share of each material tier's count dropped in each level band, none below the band a tier starts at: the
// Second tier starts at level 40 and the third at 60
export const ENEMY_MATERIAL_TIER_SHARES: number[][] = [
  [
    0.40005, 0.42694, 0.46073, 0.49441, 0.52808, 0.56176, 0.59555, 0.62922, 0.66289, 0.69669, 0.73037, 0.76404, 0.79772,
    0.83151, 0.86518, 0.89886, 0.93253, 0.96633, 1,
  ],
  [0, 0, 0, 0, 0, 0, 0, 0, 0.66289, 0.69669, 0.73037, 0.76404, 0.79772, 0.83151, 0.86518, 0.89886, 0.93253, 0.96633, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.79772, 0.83151, 0.86518, 0.89886, 0.93253, 0.96633, 1],
];
// The stand-in capsule an enemy is drawn as, in metres, and the most enemies drawn at once
// Provisional: the Hilichurl's collider in the exports
export const ENEMY_CAPSULE_RADIUS = 0.4;
export const ENEMY_CAPSULE_HEIGHT = 1.6;
export const ENEMY_CAPACITY = 64;
// Provisional: how long a hit tints an enemy's capsule, and how long a small flash stands at its middle, in seconds, with
// The flash's radius in metres and the tint's colour, until a recording of a hit measures them
export const ENEMY_HIT_TINT_SECONDS = 0.15;
export const ENEMY_HIT_FLASH_SECONDS = 0.1;
export const ENEMY_HIT_FLASH_RADIUS = 0.3;
export const HIT_TINT_COLOR = 0xff_ff_ff;
