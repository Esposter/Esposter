import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

export interface GcsimQueuedHit {
  attack: GcsimAttack;
  callLine: number;
  delay: number;
  file: string;
  hitbox?: GcsimHitbox;
  // The loop iteration a constant loop repeats the call in, where it is one: a repeated call is a tick of its attack
  iterations?: Record<string, number>;
  line: number;
}
