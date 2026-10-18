import type { AttackArea } from "#src/models/kit/AttackArea";

import { ReactionType } from "#src/models/combat/ReactionType";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { LocomotionState } from "genshin-engine";

// The frames in a second of a kit's record, whose every count of frames is divided by it once, by `toKitSeconds`
export const KIT_FRAMES_PER_SECOND = 60;
// The reach a kit's strikes, and a sword's attacks, target within: 5 metres and 6 high, the wiki's targeting reach
export const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
// The reach a kit's skill, burst and plunges target within: 15 metres and 10 high, the wiki's
export const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });
// The states a kit's normal attacks, charged attack and plunge landings start and continue on, on the ground
export const ON_FOOT_LOCOMOTION_STATES: readonly LocomotionState[] = [
  LocomotionState.Idle,
  LocomotionState.Run,
  LocomotionState.Sprint,
  LocomotionState.Walk,
];
// The states a skill or burst starts and continues in as well as on the ground: falling and jumping
export const AIRBORNE_LOCOMOTION_STATES: readonly LocomotionState[] = [LocomotionState.Fall, LocomotionState.Jump];
// Holding the attack past this many seconds makes the string's next strike a charged attack, once the strike ends
// Provisional: the hold a recording of the attack clips' input reads, through `genshin:assets timings`
export const CHARGED_ATTACK_HOLD_SECONDS = 0.3;
// The string starts again once this many seconds have passed since a strike ended unpressed
// Provisional: the pause between strikes a recording of the attack clips reads, through `genshin:assets timings`
export const NORMAL_ATTACK_RESET_SECONDS = 0.5;
// A plunge strikes once every this many seconds while it falls
// Provisional: the collision interval a recording of the plunge clip reads, through `genshin:assets timings`
export const PLUNGE_COLLISION_SECONDS = 0.3;
// A plunge landing from a drop higher than this is a high plunge, and from or under it a low one, as the wiki gives
export const HIGH_PLUNGE_MIN_HEIGHT = 2.4;
// An enemy more than this many metres above or below the body scores lower as a target, by the wiki's targeting score
export const ALTITUDE_LIMIT = 2;
export const ALTITUDE_COEFFICIENT = 0.2;

// The wiki's targeting score weighs an enemy's nearness to the body at 0.7 and its being ahead of it at 0.3
export const TARGET_DISTANCE_WEIGHT = 0.7;
export const TARGET_ANGLE_WEIGHT = 0.3;
// Provisional: an enemy's strike is its ATK at this multiple, which no table gives
// Until a recording of an enemy's attack measures it
export const ENEMY_STRIKE_TALENT_MULTIPLIER = 1;
// Provisional: the gauge an enemy's elemental strike applies, one of the 1, 1.5, 2 and 4 units the Elemental Gauge Theory
// Page says most enemy attacks apply, until each attack's own gauge is authored
export const ENEMY_STRIKE_GAUGE = 1;
// A summon lives this many seconds past its last hitmark, so the step that lands its last hit still has it on the field
// However its clock and its seconds left round
export const SUMMON_LINGER_SECONDS = 0.1;
// A field's radius when it holds every body, as a field that rings the character on the field wherever it moves, or one
// That only runs its ticks on a schedule, does
export const UNBOUNDED_FIELD_RADIUS = Number.POSITIVE_INFINITY;
// The reactions that are Electro-related whatever element they swirl or crystallize, as the wiki counts Quicken and
// Aggravate and not Spread. https://genshin-impact.fandom.com/wiki/Undone_Be_Thy_Sinful_Hex
export const ELECTRO_REACTION_TYPES: ReadonlySet<ReactionType> = new Set([
  ReactionType.Aggravate,
  ReactionType.ElectroCharged,
  ReactionType.Hyperbloom,
  ReactionType.Overloaded,
  ReactionType.Quicken,
  ReactionType.Superconduct,
]);
// The weapons a melee infusion converts the attacks of, a sword's, a claymore's or a polearm's, while a bow or a catalyst
// Wielder keeps its own, as gcsim v2.47.2 (MIT) gives Fantastic Voyage's and Layered Frost's infusions
export const MELEE_WEAPON_TYPES: ReadonlySet<WeaponType> = new Set([
  WeaponType.Claymore,
  WeaponType.Polearm,
  WeaponType.Sword,
]);
// The status a Natlan character carries while it is in its Nightsoul's Blessing, for the seconds the blessing lasts
export const NIGHTSOUL_BLESSING_STATUS_ID = "nightsoul-blessing";
// The resource a Natlan character holds its Nightsoul points as, which it holds only while its blessing lasts
export const NIGHTSOUL_POINTS_ID = "nightsoul-points";
// The status Haunted Night puts a Geo character in, for the seconds it lasts, which its Nightingale's Song stacks last with
export const HAUNTED_NIGHT_STATUS_ID = "haunted-night";
// The stacks of Nightingale's Song a character holds in Haunted Night, each one a hit of Geo DMG by its party consumes
export const NIGHTINGALE_SONG_STATUS_ID = "nightingale-song";
// The Nightingale's Song stacks a character has gained from Geo Constructs since its Haunted Night began, against the cap
export const NIGHTINGALE_SONG_EXTRA_STATUS_ID = "nightingale-song-extra";

// The Polestar Field a Stellar-Conduct leaves round the body, 15 metres in radius, as the wiki and gcsim give it
export const POLESTAR_FIELD_RADIUS = 15;
// The seconds a Polestar Field stands for, and a Stellar-Conduct refreshes it to. The wiki gives 7 seconds where gcsim
// Gives 6 (sscFieldDur in v2.47.2): the wiki's is kept, provisional until a recording of the field reads it
export const POLESTAR_FIELD_SECONDS = 7;
// A Polestar Field's schedule, every 4 seconds, the wiki's and gcsim's think interval (sscThinkInterval)
export const POLESTAR_FIELD_TICK_SECONDS = 4;
// The id a Polestar Field is found by, so a standing one is refreshed rather than a second placed
export const POLESTAR_FIELD_ID = "polestar";
// The Physical RES a Polestar Field takes off the enemies inside it, 40%: the wiki's Stellar-Conduct page, and gcsim's
// Physical RES of -0.40 in the field's area (pkg/reactable/stellarconduct_gadget.go)
export const POLESTAR_PHYSICAL_RES_REDUCTION = 0.4;
// The id a Polestar Field's reduction is held under on each enemy it is over, so each step refreshes it rather than adds
export const POLESTAR_SHRED_STATUS_ID = "polestar-shred";
// The source the Starlight Prism's Cryo and Electro DMG Bonus buffs are held under, so each step restarts them
export const POLESTAR_BUFF_SOURCE = "polestar";
// Stellar Swirls a vortex takes before it explodes at once: three after its level-up (gcsim sswMaxStacks)
export const STELLAR_VORTEX_MAX_STACKS = 6;
// A Stellar Vortex's explosion radius at Lv. 1 and at Lv. 2 (gcsim sswStackRadius)
export const STELLAR_VORTEX_LEVEL_ONE_RADIUS = 6;
export const STELLAR_VORTEX_LEVEL_TWO_RADIUS = 8;

// Measured: gcsim v2.47.2 template/sourcewaterdroplet/sourcewaterdroplet.go, a droplet lasts 878 frames
export const SOURCEWATER_DROPLET_FIELD_ID = "sourcewater-droplet";
export const SOURCEWATER_DROPLET_SECONDS = 878 / KIT_FRAMES_PER_SECOND;

// A tick falls due once the seconds left to it are within this of none: a field counts its seconds down a step at a time,
// And the float sum of a frame's seconds drifts a sub-nanosecond past the frame it is due on, which would land it a frame late
export const KIT_TICK_TOLERANCE_SECONDS = 1e-9;
