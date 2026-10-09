import type { TerrainTile } from "#src/models/terrain/TerrainTile";
import type { Mesh } from "three";

// A far level's ground as one mesh over slots of a tile each, its index naming the slots the view draws
export interface TerrainRing {
  // Writes a tile into a free slot, growing the ring when every slot is held, and uploads that slot alone
  add: (tile: TerrainTile) => void;
  dispose: () => void;
  // Draws these tiles, hiding the mesh when none is held, and writes the index only when they differ from the last
  draw: (keys: readonly number[]) => void;
  mesh: Mesh;
  // Frees a tile's slot for the next tile to arrive, leaving its arrays where they are, since no index names them
  remove: (key: number) => void;
}
