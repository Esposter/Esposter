import type { Landmark } from "genshin-world";

// What a region's ground is fitted from, read once for the region and handed to each of its pieces and quarters: the
// Height of its terrain tiles at a point in the game's axes, the world's origin and every region file's landmarks
export interface GroundSource {
  getGameHeight: (x: number, z: number) => number;
  landmarks: Landmark[];
  origin: [number, number, number];
}
