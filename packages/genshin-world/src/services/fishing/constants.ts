import type {
  FishGeometryOptions,
  FloatGeometryOptions,
  RippleRingOptions,
  RodGeometryOptions,
  SplashGeometryOptions,
} from "genshin-engine";

// The hours of the game's day a fishing pool's day stock is drawn in, from the day's start up to the night's, and the
// Night stock otherwise, on the game's clock
export const FISHING_DAY_START_HOUR = 6;
export const FISHING_NIGHT_START_HOUR = 18;
// A caught fish comes back to its stock this long after it is caught, as the wiki gives it
export const FISH_RESPAWN_DURATION: Temporal.Duration = Temporal.Duration.from({ hours: 72 });
// Provisional: the tension bar's full range, in the units the fish's zone widths, offsets and speeds are read in, which
// The table's widths and offsets fit a bar of one hundred. The fishing-reel recording on the roadmap's Recordings owed
// List sets its scale
export const REEL_BAR_MAX = 100;
// Provisional: the same recording sets how many seconds the line may lie out of its zone before it breaks
export const REEL_LOST_OUT_OF_ZONE_SECONDS = 3;
// The Serenitea Pot as the bag holds it: the widget material the game names by its own text. Fishing needs one owned
export const SERENITEA_POT_ITEM_ID = 220026;
// The main quest the wiki names beside the Pot for the unlock, Exploding Population, by the id its progress is saved under.
// The save carries a quest only once it is in the carried quests, which holds it out for now
export const SERENITEA_POT_QUEST_ID = "70661";
// Provisional: how long a strike's splash shows, in seconds, from the moment the strike hooks the fish
export const FISHING_SPLASH_SECONDS = 1;
// The bodies a fish stand-in is drawn as, in turn by its category, the standard body first. Each is in metres
export const FISH_STAND_IN_SHAPES: FishGeometryOptions[] = [
  { bodyDepth: 0.3, bodyLength: 0.9, tailSpread: 0.35 },
  { bodyDepth: 0.2, bodyLength: 1.1, tailSpread: 0.3 },
  { bodyDepth: 0.45, bodyLength: 0.8, tailSpread: 0.4 },
];
// The stand-ins of the rod, the float, the splash and a point's ring, each in metres, and their colours
export const FISHING_ROD_OPTIONS: RodGeometryOptions = { baseRadius: 0.02, length: 2.4, tipRadius: 0.004 };
export const FISHING_ROD_COLOR = "#8a6a4a";
// The height the rod is held at above the ground the character stands on
export const FISHING_ROD_HAND_HEIGHT = 1.2;
export const FISHING_FLOAT_OPTIONS: FloatGeometryOptions = { height: 0.12, radius: 0.04 };
export const FISHING_FLOAT_COLOR = "#d9553b";
export const FISHING_FISH_COLOR = "#7fa8c9";
// The height a fish is drawn above the water it is hooked from, so its body shows above the surface
export const FISHING_FISH_LIFT = 0.1;
export const FISHING_SPLASH_OPTIONS: SplashGeometryOptions = { dropletCount: 12, dropletSize: 0.05, radius: 0.5 };
export const FISHING_POINT_RING_OPTIONS: RippleRingOptions = { innerRadius: 0.8, outerRadius: 1 };
// The most fishing points a ring is drawn at at once, which the instanced ring is sized to
export const FISHING_POINT_CAPACITY = 256;
