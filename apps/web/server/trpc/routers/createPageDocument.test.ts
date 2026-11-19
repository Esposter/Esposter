import type { SurveyDocument } from "vue-survey-engine-headless";

import { v7 } from "uuid";
import { describe } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

// A survey document whose one page holds the elements given, parsed so a fixture is a document a save would accept
export const createPageDocument = (children: unknown[]): SurveyDocument =>
  surveyDocumentSchema.parse({
    content: [{ props: { children, enableIf: "", id: v7() }, type: SurveyNodeType.Page }],
    root: { props: { backgroundImage: "" } },
  });

describe.todo("createPageDocument");
