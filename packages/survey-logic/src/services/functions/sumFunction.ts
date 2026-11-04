import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";
import { sumSurveyNumbers } from "#src/services/shared/sumSurveyNumbers";

// The sum of the numbers the values read as, arrays flattened. A value that reads as no number adds nothing, so none adds zero
export const sumFunction: SurveyLogicFunction = (args) => sumSurveyNumbers(flattenSurveyNumbers(args));
