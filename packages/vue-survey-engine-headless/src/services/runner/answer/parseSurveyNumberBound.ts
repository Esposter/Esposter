import { normalizeString } from "@esposter/shared";

// A bound a number question types as text, read as a number when it reads as one, so an empty or unreadable bound is no
// Bound at all
export const parseSurveyNumberBound = (bound: string): number | undefined => {
  const value = Number(bound);
  return normalizeString(bound) !== "" && Number.isFinite(value) ? value : undefined;
};
