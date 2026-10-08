// A stone as its game material holds it: its albedo, how smooth it is, the colour it tints its highlights with, and the
// Glow along its edges, its colour, how tight it hugs the silhouette, how strong it is and the length it is drawn from
export interface StoneMaterialOptions {
  albedo: string;
  glowRange: number;
  rimColor: readonly number[];
  rimPower: number;
  rimStrength: number;
  smoothness: number;
  specularColor: readonly number[];
}
