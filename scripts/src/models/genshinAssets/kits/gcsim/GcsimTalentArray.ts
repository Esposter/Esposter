// A multiplier array of a talent file, `attack = [][]float64{...}` or `kick = []float64{...}`, named by the Go variable
// Its attacks read it with: the line it is declared on, and each row of its values, a row being one innermost brace
// Group's numbers, so a flat array is one row and a nested one a row per hit
export interface GcsimTalentArray {
  line: number;
  rows: number[][];
}
