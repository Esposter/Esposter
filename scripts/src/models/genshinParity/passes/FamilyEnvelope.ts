// A family's envelope at a radius: its pixels closed, its depth averaged over the family within the radius, and its
// Normals averaged there and normalised, so a scattered family reads as the mass its cards make
export interface FamilyEnvelope {
  depth: Float64Array;
  mask: Uint8Array;
  normal: Float64Array;
}
