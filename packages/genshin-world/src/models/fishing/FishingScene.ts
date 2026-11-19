import type { FishingFish } from "#src/models/fishing/FishingFish";
import type { GroundPoint } from "genshin-engine";

// The pieces of the reel's scene as the cast stands: the fish hooked at the lure, the point the lure lies at while its
// Line is out, and the splash's age, from zero to one, of a strike that caught the bite
export interface FishingScene {
  fish?: FishingFish | undefined;
  lure?: GroundPoint | undefined;
  splash?: undefined | { age: number };
}
