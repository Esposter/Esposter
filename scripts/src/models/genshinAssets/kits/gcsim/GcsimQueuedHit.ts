import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

export interface GcsimQueuedHit {
  attack: GcsimAttack;
  callLine: number;
  delay: number;
  file: string;
  hitbox?: GcsimHitbox;
  line: number;
}
