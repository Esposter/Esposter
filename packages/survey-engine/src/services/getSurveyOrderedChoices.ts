import type { SurveyChoice } from "#src/models/SurveyChoice";

import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { createSeededRandom } from "#src/services/createSeededRandom";
import { getSurveyChoiceText } from "#src/services/getSurveyChoiceText";
import { hashSurveySeed } from "#src/services/hashSurveySeed";
import { exhaustiveGuard } from "@esposter/shared";

// The choices in the order a respondent sees them: the list's own, by text, or shuffled by a seed the session holds so the order holds still
export const getSurveyOrderedChoices = (
  choices: SurveyChoice[],
  choicesOrder: SurveyChoicesOrder,
  seed: string,
): SurveyChoice[] => {
  switch (choicesOrder) {
    case SurveyChoicesOrder.Ascending:
      return choices.toSorted((firstChoice, secondChoice) =>
        getSurveyChoiceText(firstChoice).localeCompare(getSurveyChoiceText(secondChoice)),
      );
    case SurveyChoicesOrder.Descending:
      return choices.toSorted((firstChoice, secondChoice) =>
        getSurveyChoiceText(secondChoice).localeCompare(getSurveyChoiceText(firstChoice)),
      );
    case SurveyChoicesOrder.None:
      return choices;
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
