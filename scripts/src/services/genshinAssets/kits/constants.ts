import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { CACHE_ROOT } from "@esposter/shared-node/cache";
import { KitPlunge } from "genshin-world";
import { join } from "node:path";

// The one gcsim tag the builder reads, its last MIT release. Every later tag is under gcsim's own licence, so its
// Current branch is read only to classify a value a kit holds, never stored
export const GCSIM_TAG = "v2.47.2";
export const GCSIM_MAIN_BRANCH = "main";
export const GCSIM_REPOSITORY_URL = "https://github.com/genshinsim/gcsim";
export const GCSIM_RAW_URL = "https://raw.githubusercontent.com/genshinsim/gcsim";
export const GCSIM_CHARACTERS_PATH = "internal/characters";
// A character folder's config, which a folder holding only other folders, the Traveler's, does not have
export const GCSIM_CONFIG_FILE = "config.yml";
// The Traveler's English name, which is the kit's and the wiki's talent category's, `Category:Traveler_Talents`
export const TRAVELER_NAME = "Traveler";
// The Traveler's form gcsim reads the kit as, Lumine's Anemo one: its folder under the Traveler's and the heading its
// Block carries on the wiki, whose gender gcsim's `NewTraveler` gives its constants at
export const GCSIM_TRAVELER_FORM = "Lumine";
// The frame helpers gcsim's action files build an action's cancel frames with
export const GCSIM_NORMAL_FRAMES_CALLEE = "frames.InitNormalCancelSlice";
// The frames a second of game time is, the unit a gcsim cooldown is written in and the table gives it in seconds
export const GCSIM_FRAMES_PER_SECOND = 60;
export const GCSIM_ABILITY_FRAMES_CALLEE = "frames.InitAbilSlice";
// The operators of Go's compound assignments, each written before its `=`, `&^` the AND NOT one. The tokenizer splits a
// Shift's `<<=` into `<` and `<=`, so a reader matches the operator's characters rather than one token
export const GO_COMPOUND_ASSIGNMENT_OPERATORS: readonly string[] = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "&",
  "|",
  "^",
  "<<",
  ">>",
  "&^",
];
// The charge level a bow's aimed shot is fired at when its config sets none, gcsim's `attacks.AimParamLv1`, the fully
// Charged shot
export const GCSIM_AIM_CHARGE_LEVEL = 1;
// A value's path in a kit's record: its keys and array indexes joined by dots, `normalAttacks.0.hits.1.poiseDamage`,
// Where a last key of `length` is an array's length
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const KIT_VALUE_PATH_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9]*(?:\.(?:\d+(?:-\d+)?|[A-Za-z][A-Za-z0-9]*))*$/u;
export const KIT_LENGTH_KEY = "length";
// A hit's multiplier path, `hits.fatalBlossoms.1.multiplier`, `skillHolds.0.hits.0.multiplier` or a single hit's own,
// `hitFields.hymnOfEternalRestLunarBloom.multiplier`, with the path of the hit as `hitPath`. Every hit's multiplier is
// Read by this one matcher
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const KIT_HIT_MULTIPLIER_REGEX: RegExp =
  /^(?<hitPath>(?:.+\.)?(?:hits\.(?:\d+|[^.]+(?:\.\d+)?)|hitFields\.[^.]+))\.multiplier$/u;
// Where gcsim's tag is cloned and the wiki's answers are kept between runs, outside the repository: the tag never
// Moves, and a wiki page is read again only once its cached answer is deleted
export const GCSIM_CACHE_DIRECTORY: string = join(CACHE_ROOT, `gcsim-${GCSIM_TAG}`);
export const WIKI_CACHE_DIRECTORY: string = join(CACHE_ROOT, "genshin-wiki");
export const WIKI_API_URL = "https://genshin-impact.fandom.com/api.php";
// The attack tags gcsim writes each kit slot's hits with
export const GCSIM_CHARGED_ATTACK_TAG = "attacks.AttackTagExtra";
export const GCSIM_SKILL_ATTACK_TAGS: readonly string[] = [
  "attacks.AttackTagElementalArt",
  "attacks.AttackTagElementalArtHold",
];
export const GCSIM_BURST_ATTACK_TAGS: readonly string[] = ["attacks.AttackTagElementalBurst"];
// The gcsim elements a hit of no element is named by, which applies no element and no gauge
export const GCSIM_ELEMENTLESS_ELEMENTS: ReadonlySet<string> = new Set(["attributes.NoElement", "attributes.Physical"]);
// The gauge a hit applies is its durability over 25, gcsim's units to the game's
export const GCSIM_DURABILITY_PER_GAUGE = 25;
// The seconds a hold must be held with no table or wiki figure for it, Bennett's first Charge Level's
export const UNMEASURED_HOLD_SECONDS = 0.5;
// The qualified names gcsim's internal cooldown tags are written as, `attacks.ICDTagNone` among them
export const GCSIM_COOLDOWN_TAG_PREFIX = "attacks.ICDTag";
export const GCSIM_NO_INTERNAL_COOLDOWN_TAG = "attacks.ICDTagNone";
// The character whose gcsim plunge areas a kit with no plunge file of its own borrows
export const GCSIM_PLUNGE_FALLBACK_FOLDER = "bennett";
// The names gcsim gives a skill's holds' constants, the shorter hold first, and the hitbox a hold of one hit lands in
export const GCSIM_SKILL_HOLD_PREFIXES: readonly string[] = ["skillShortHold", "skillHold"];
export const GCSIM_SKILL_HOLD_HITBOX_NAME = "E-Hold";
// The hitboxes a skill pressed rather than held lands its one hit in
export const GCSIM_SKILL_PRESS_HITBOX_NAMES: readonly string[] = ["E-Tap", "E-Press"];
// The file a gcsim character's own plunges are in
export const GCSIM_PLUNGE_FILE = "plunge.go";
// The two landings: each one's plunge, its frames and hitmark named by its prefix, and its area's hitbox by name
export const GCSIM_PLUNGE_LANDINGS: readonly (readonly [KitPlunge, string, string])[] = [
  [KitPlunge.Low, "low", "Low_Plunge"],
  [KitPlunge.High, "high", "High_Plunge"],
];
export const GCSIM_PLUNGE_COLLISION_HITBOX_NAME = "Plunge";
// A claymore's charged attack gcsim has no file for lands its spin and its final blow at these frames and ends at the
// Next, as the kits without one share Diluc's
export const NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES: readonly number[] = [30, 60];
export const NO_ACTION_FILE_CLAYMORE_CHARGED_ANIMATION_FRAMES = 72;
// The normal attacks a character's stance gives, by the character's folder: Wriothesley's Chilling Penalty, whose enhanced
// Normal attacks gcsim reads at attack state 1 and multiplies by the Enhanced Repelling Fist table
export const GCSIM_STANCE_NORMAL_ATTACKS: Partial<Record<string, GcsimStanceNormalAttack>> = {
  wriothesley: { factorLabel: "Enhanced Repelling Fist DMG", path: "stances.chillingPenalty.normalAttacks", state: 1 },
};
// Each character's authored overlay, `<character>.json` by its English name in kebab case
export const KIT_OVERLAY_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "kits");
// The most iterations a Go loop may take before its calls are read once, as a loop too long to expand
export const GO_MAX_LOOP_ITERATIONS = 100;
