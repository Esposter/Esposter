import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";

// A hit on the ores and the body its area is drawn from
export interface OreStrike {
  body: KitBody;
  hit: OreHit;
}
