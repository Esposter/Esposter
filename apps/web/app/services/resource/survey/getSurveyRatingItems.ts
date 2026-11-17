import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

// The steps of a rating scale of the given count, counted up from its first step, each drawn as its number and holding that number as its value
export const getSurveyRatingItems = (rateMin: number, rateCount: number): UiMenuItem<number>[] =>
  Array.from({ length: rateCount }, (_value, index) => ({ title: String(rateMin + index), value: rateMin + index }));
