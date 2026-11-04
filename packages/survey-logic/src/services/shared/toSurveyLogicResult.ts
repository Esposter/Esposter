// An operation whose result is not finite has no result: a number that overflows, or one that is not a number at all
export const toSurveyLogicResult = (result: number): number | undefined =>
  Number.isFinite(result) ? result : undefined;
