// The index a substring reads from a number: a fraction loses its fraction.
// An index past either end of the text stops at that end.
export const getSurveyTextIndex = (index: number, length: number): number =>
  Math.min(Math.max(Math.trunc(index), 0), length);
