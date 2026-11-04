import type { UiMenuItem } from "@/models/ui/UiMenuItem";

// The steps of a rating scale of the given count, each drawn as its number and holding that number as its value
export const getSurveyRatingItems = (rateCount: number): UiMenuItem<number>[] =>
  Array.from({ length: rateCount }, (_value, index) => ({ title: String(index + 1), value: index + 1 }));
