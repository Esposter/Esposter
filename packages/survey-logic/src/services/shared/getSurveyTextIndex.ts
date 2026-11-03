// The index a substring reads from a number: a fraction loses its fraction, and an index past either end of the text stops
// At that end, as SurveyJS's substring does. NaN reads as zero
export const getSurveyTextIndex = (index: number, length: number): number =>
  Math.min(Math.max(Math.trunc(index) || 0, 0), length);
