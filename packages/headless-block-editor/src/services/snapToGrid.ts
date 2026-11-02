// The value rounded to the nearest multiple of the grid size, a value halfway between two multiples rounding up
export const snapToGrid = (value: number, gridSize: number): number => Math.round(value / gridSize) * gridSize;
