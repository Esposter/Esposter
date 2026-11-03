import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { checkIsSurveyValueGreater } from "#src/services/shared/checkIsSurveyValueGreater";
import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The largest of the values passed, arrays flattened, or empty when none is passed
export const maxFunction: SurveyLogicFunction = (args) =>
  getSurveyExtreme(flattenSurveyValues(args), (best, candidate) => checkIsSurveyValueGreater(candidate, best));
