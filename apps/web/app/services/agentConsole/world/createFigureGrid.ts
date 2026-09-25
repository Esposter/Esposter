import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { fillVoxelBox } from "@/services/agentConsole/world/fillVoxelBox";

// An agent three voxels wide, two deep and six tall: legs, a body in its cloth and a head
export const createFigureGrid = (cloth: PaletteColor): VoxelGrid => {
  const figureGrid = { depth: 2, height: 6, voxels: new Uint8Array(3 * 6 * 2), width: 3 };
  fillVoxelBox(figureGrid, { color: PaletteColor.Stone, max: [0, 1, 1], min: [0, 0, 0] });
  fillVoxelBox(figureGrid, { color: PaletteColor.Stone, max: [2, 1, 1], min: [2, 0, 0] });
  fillVoxelBox(figureGrid, { color: cloth, max: [2, 3, 1], min: [0, 2, 0] });
  fillVoxelBox(figureGrid, { color: PaletteColor.Skin, max: [2, 5, 1], min: [0, 4, 0] });
  return figureGrid;
};
