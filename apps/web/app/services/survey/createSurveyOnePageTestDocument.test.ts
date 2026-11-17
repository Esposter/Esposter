import { describe } from "vitest";
import { surveyDocumentSchema, SurveyNodeType } from "vue-survey-engine-headless";

// A one-page document of the given children under fixed ids, so a test can assert the whole document
export const createSurveyOnePageTestDocument = (children: object[]) =>
  surveyDocumentSchema.parse({
    content: [{ props: { children, enableIf: "", id: "page" }, type: SurveyNodeType.Page }],
    root: { props: { backgroundImage: "" } },
  });

describe.todo("createSurveyOnePageTestDocument");
