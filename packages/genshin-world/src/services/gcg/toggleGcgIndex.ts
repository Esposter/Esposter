// A list of indices with the given one taken out where it is in, or put at its end where it is not, which is how the board
// Picks and unpicks a die or a card
export const toggleGcgIndex = (indices: number[], index: number): number[] =>
  indices.includes(index) ? indices.filter((item) => item !== index) : [...indices, index];
