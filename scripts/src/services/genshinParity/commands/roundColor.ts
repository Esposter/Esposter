// The decimals a published light keeps, past which its colours move nothing the screen shows
const LIGHT_DECIMALS = 4;

export const roundColor = (color: readonly number[]): number[] =>
  color.map((value) => Number(value.toFixed(LIGHT_DECIMALS)));
