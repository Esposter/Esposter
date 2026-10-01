// A stone as its game material holds it: its albedo, how smooth it is, the colour it tints its highlights with, and the
// Glow along its edges, its colour, how tight it hugs the silhouette and how strong it is
export interface StoneMaterialOptions {
  albedo: string;
  rimColor: readonly number[];
  rimPower: number;
  rimStrength: number;
  smoothness: number;
  specularColor: readonly number[];
}
