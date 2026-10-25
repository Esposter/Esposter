import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

// A loop over an area query's enemies, `for _, t := range targets {` with `targets` the query or the query written in
// Place: where its body starts and ends, and the hitbox of the area the query is made over, read where the query is written
export interface EnemyQueryLoop {
  bodyEnd: number;
  bodyStart: number;
  hitbox?: GcsimHitbox;
}
