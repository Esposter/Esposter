import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

// What gcsim gives one hit of a kit: the hitbox its area is read from, its `AttackInfo`, its hitmark, its poise and its
// Talent parameter
export interface GcsimHitSource {
  areaHitbox?: GcsimHitbox;
  attack?: GcsimAttack;
  hitmark?: { file: string; line: number; value: number };
  // The poise the attack's poise variable gives this hit, by its place in its string
  poiseDamage?: { line: number; value: number };
  talentLeaf?: GcsimTalentLeaf;
}
