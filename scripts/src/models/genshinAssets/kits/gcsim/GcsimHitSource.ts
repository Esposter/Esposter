import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimMultiplierKey } from "#src/models/genshinAssets/kits/gcsim/GcsimMultiplierKey";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

// What gcsim gives one hit of a kit: the hitbox its area is read from, its `AttackInfo`, its hitmark, its poise and its
// Talent parameter
export interface GcsimHitSource {
  areaHitbox?: GcsimHitbox | undefined;
  attack?: GcsimAttack | undefined;
  // The constellation a named hit's variant is read at, which its multiplier names
  constellation?: number | undefined;
  hitmark?: undefined | { file: string; line: number; value: number };
  // The multiplier key the talent leaf writes, `multiplierFactor` for a stance's skill table multiplied into its normal attack
  multiplierKey?: GcsimMultiplierKey | undefined;
  // The poise the attack's poise variable gives this hit, by its place in its string
  poiseDamage?: undefined | { line: number; value: number };
  talentLeaf?: GcsimTalentLeaf | undefined;
}
