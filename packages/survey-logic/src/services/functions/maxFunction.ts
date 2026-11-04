import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The largest of the numbers the values read as, arrays flattened, or undefined when none reads as a number
export const maxFunction: SurveyLogicFunction = (args) =>
  getSurveyExtreme(flattenSurveyNumbers(args), (best, candidate) => candidate > best);
