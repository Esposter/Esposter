import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { averageSurveyNumbers } from "#src/services/shared/averageSurveyNumbers";
import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";

// The average of the numbers the values read as, arrays flattened
export const avgFunction: SurveyLogicFunction = (args) => averageSurveyNumbers(flattenSurveyNumbers(args));
