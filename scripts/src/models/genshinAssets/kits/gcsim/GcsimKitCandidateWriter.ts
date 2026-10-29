import type { GcsimHitSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHitSource";
import type { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import type { AttackArea } from "genshin-world";

// What a gcsim character's values reach its kit's candidates through: a value cited at a file of the character's
// Folder, or another's, and its line, the animation frames of the first of the named constants, a hit's values from
// What gcsim gives it, and the shared rule's value for an action with no file of its own
export interface GcsimKitCandidateWriter {
  add: (path: string, value: unknown, file: string, line: number, cause?: KitProvisionalCause) => void;
  addFrames: (path: string, ...names: string[]) => void;
  addHit: (path: string, hitSource: GcsimHitSource, targetingArea: AttackArea) => void;
  addNoActionFileRule: (path: string, value: number) => void;
  toFile: (name: string, from?: string) => string;
}
