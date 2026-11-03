import type { SurveyChoice } from "#src/models/SurveyChoice";
import { exhaustiveGuard } from "@esposter/shared";

import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { getSurveyChoiceText } from "#src/services/getSurveyChoiceText";
import { hashSurveySeed } from "#src/services/hashSurveySeed";

// Mulberry32, a small seeded generator, so the same seed draws the same order on every render and every device
const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

// The choices in the order a respondent sees them: the list's own, by text, or shuffled by a seed the session holds so the order holds still
export const getSurveyOrderedChoices = (
  choices: SurveyChoice[],
  choicesOrder: SurveyChoicesOrder,
  seed: string,
): SurveyChoice[] => {
  switch (choicesOrder) {
    case SurveyChoicesOrder.None:
      return choices;
    case SurveyChoicesOrder.Ascending:
      return choices.toSorted((a, b) => getSurveyChoiceText(a).localeCompare(getSurveyChoiceText(b)));
    case SurveyChoicesOrder.Descending:
      return choices.toSorted((a, b) => getSurveyChoiceText(b).localeCompare(getSurveyChoiceText(a)));
    case SurveyChoicesOrder.Random: {
      const random = createSeededRandom(hashSurveySeed(seed));
      const remaining = [...choices];
      const shuffled: SurveyChoice[] = [];

      while (remaining.length > 0) shuffled.push(...remaining.splice(Math.floor(random() * remaining.length), 1));

      return shuffled;
    }
    default:
      return exhaustiveGuard(choicesOrder);
  }
};
