import type { PmxMorphKind } from "#src/models/character/PmxMorphKind";

// A PMX morph. A vertex morph holds the vertices it moves, with each one's offset as three floats; a group morph holds
// The morphs it sets, by their index in the model's list, with each one's influence. A morph of any other kind is kept
// In its place with neither
export interface PmxMorph {
  indices: Uint32Array;
  kind: PmxMorphKind;
  name: string;
  values: Float32Array;
}
