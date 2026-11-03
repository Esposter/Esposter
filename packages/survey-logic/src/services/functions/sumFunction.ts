import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyValues } from "#src/services/shared/flattenSurveyValues";
import { sumSurveyValues } from "#src/services/shared/sumSurveyValues";

// The sum of the values passed, arrays flattened. A text that is not a number is joined to the total as text, as SurveyJS does
export const sumFunction: SurveyLogicFunction = (args) => sumSurveyValues(flattenSurveyValues(args));
