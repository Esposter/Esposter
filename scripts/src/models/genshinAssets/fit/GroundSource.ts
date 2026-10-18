import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { Landmark } from "genshin-world";

// What a region's ground is fitted from, read once for the region and handed to each of its pieces and quarters: the
// Height of its terrain tiles at a point in the game's axes, the world's origin and every region file's landmarks. The
// City areas are read by the first capital that needs them, and every capital after shares that read
export interface GroundSource {
  getCityAreas: () => Promise<CityArea[]>;
  getGameHeight: (x: number, z: number) => number;
  landmarks: Landmark[];
  origin: [number, number, number];
}
