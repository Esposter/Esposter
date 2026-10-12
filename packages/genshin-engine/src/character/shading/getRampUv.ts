import { RampLayout } from "#src/models/character/RampLayout";

// The texture coordinate a ramp is read at for a column and a row, by its layout: a horizontal ramp reads its column across
// The row, with the row read from the ramp's bottom up, and a vertical one reads its column up its single column, lit at
// The top, where the MMD loader puts a toon's lit end
export const getRampUv = (layout: RampLayout, column: number, row: number): [number, number] =>
  layout === RampLayout.Horizontal ? [column, 1 - row] : [0.5, column];
