// A bound a number question types as text, read as a number when it reads as one, so an empty or unreadable bound is no bound at all
export const parseSurveyNumberBound = (bound: string): number | undefined => {
  const value = Number(bound);
  return bound.trim() !== "" && Number.isFinite(value) ? value : undefined;
};
