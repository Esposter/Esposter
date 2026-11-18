// A ground key read back into its parts: its region, its area, and each level of the split under the area as its quarter
// Indices, one index for a quarter and several for a joined group. A key that names no area has no path
export interface GroundPieceKey {
  area?: string | undefined;
  path: number[][];
  region: string;
}
