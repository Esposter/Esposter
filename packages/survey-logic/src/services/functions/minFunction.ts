import type { SurveyLogicFunction } from "#src/models/SurveyLogicFunction";

import { flattenSurveyNumbers } from "#src/services/shared/flattenSurveyNumbers";
import { getSurveyExtreme } from "#src/services/shared/getSurveyExtreme";

// The smallest of the numbers the values read as, arrays flattened, or undefined when none reads as a number
export const minFunction: SurveyLogicFunction = (args) =>
  getSurveyExtreme(flattenSurveyNumbers(args), (best, candidate) => candidate < best);
