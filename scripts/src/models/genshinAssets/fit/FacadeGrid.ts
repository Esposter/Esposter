import type { Vector } from "#src/models/shared/Vector";

// A tower's surface unrolled round its axis on a grid of square cells, a row wide round the tower: each cell's linear
// Diffuse colour and metal, how far in it stands from the lathe's wall at its row (out from it below none), and which
// Of its mesh's groups drew it, below none where nothing did
export interface FacadeGrid {
  cellSize: number;
  colors: Vector[];
  depths: number[];
  height: number;
  metals: number[];
  tags: number[];
  width: number;
}
