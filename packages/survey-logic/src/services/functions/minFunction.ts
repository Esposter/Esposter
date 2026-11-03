import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyValueGreater } from "#src/services/shared/checkIsSurveyValueGreater";
import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The smallest of the values passed, arrays flattened, or empty when none is passed
export const minFunction: SurveyLogicFunction = (args) =>
  getSurveyExtreme(flattenSurveyValues(args), (best, candidate) => checkIsSurveyValueGreater(best, candidate));
