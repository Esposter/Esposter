import type { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";

// The layout of a `combat` hitbox constructor's arguments: an on-target one takes its target first, a source one its
// Source then its centre, each then its offset, its size (a circle's radius, a box's width and height) and a fan angle
// Where it has one
export interface HitboxConstructor {
  fanAngle: boolean;
  onTarget: boolean;
  shape: GcsimHitboxShape;
}
