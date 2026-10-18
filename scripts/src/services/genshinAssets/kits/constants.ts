import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { CACHE_ROOT } from "@esposter/shared-node/cache";
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
// The frame helpers gcsim's action files build an action's cancel frames with
export const GCSIM_NORMAL_FRAMES_CALLEE = "frames.InitNormalCancelSlice";
export const GCSIM_ABILITY_FRAMES_CALLEE = "frames.InitAbilSlice";
// The charge level a bow's aimed shot is fired at when its config sets none, gcsim's `attacks.AimParamLv1`, the fully
// Charged shot
export const GCSIM_AIM_CHARGE_LEVEL = 1;
// A value's path in a kit's record: its keys and array indexes joined by dots, `normalAttacks.0.hits.1.poiseDamage`,
// Where a last key of `length` is an array's length
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const KIT_VALUE_PATH_REGEX: RegExp = /^[A-Za-z][A-Za-z0-9]*(?:\.(?:\d+(?:-\d+)?|[A-Za-z][A-Za-z0-9]*))*$/u;
export const KIT_LENGTH_KEY = "length";
// A hit's multiplier path, `hits.fatalBlossoms.1.multiplier` or `skillHolds.0.hits.0.multiplier`, with the path of the hit
// List it sits in as `hitPath`: the one matcher every hit list's multiplier is read by
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a regex literal would otherwise infer
export const KIT_HIT_MULTIPLIER_REGEX: RegExp = /^(?<hitPath>(?:.+\.)?hits\.(?:\d+|[^.]+(?:\.\d+)?))\.multiplier$/u;
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
export const GCSIM_PHYSICAL_ELEMENT = "attributes.Physical";
// The gauge a hit applies is its durability over 25, gcsim's units to the game's
export const GCSIM_DURABILITY_PER_GAUGE = 25;
// The seconds a hold must be held with no table or wiki figure for it, Bennett's first Charge Level's
export const UNMEASURED_HOLD_SECONDS = 0.5;
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
// A claymore's charged attack gcsim has no file for lands its spin and its final blow at these frames and ends at the
// Next, as the kits without one share Diluc's
export const NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES: readonly number[] = [30, 60];
export const NO_ACTION_FILE_CLAYMORE_CHARGED_ANIMATION_FRAMES = 72;
// Each character's authored overlay, `<character>.json` by its English name in kebab case
export const KIT_OVERLAY_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "kits");
