// A number as a screen reader says it: the game's label for it before the number, or the number alone where its label
// Has no Text id yet
export const formatGcgNumberLabel = (label: string, value: number): string =>
  label ? `${label} ${value}` : `${value}`;
