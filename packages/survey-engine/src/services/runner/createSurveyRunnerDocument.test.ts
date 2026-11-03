import type { SurveyDocument } from "#src/models/SurveyDocument";

import { surveyDocumentSchema } from "#src/services/surveyDocumentSchema";
import { describe } from "vitest";

// A survey document parsed from its pages and its root's calculated values, so a fixture is a document the save would accept
// Every default it omits is the schema's own
export const createSurveyRunnerDocument = (content: unknown[], calculatedValues: unknown[] = []): SurveyDocument =>
  surveyDocumentSchema.parse({ content, root: { props: { calculatedValues } } });

describe.todo("createSurveyRunnerDocument");
