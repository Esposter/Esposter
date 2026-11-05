import { sumSurveyNumbers } from "#src/services/shared/sumSurveyNumbers";

// The average of the numbers: their total over how many there are.
// Nothing to average has no average, and neither does a total that overflows
export const averageSurveyNumbers = (numbers: number[]): number | undefined => {
  if (numbers.length === 0) return undefined;

  const total = sumSurveyNumbers(numbers);
  return total === undefined ? undefined : total / numbers.length;
};
