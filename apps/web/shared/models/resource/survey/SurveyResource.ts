import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { ToData } from "@esposter/shared";
import type { SurveyDocument } from "survey-engine";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { parseJsonPointer } from "@esposter/shared";
import { checkSurveyDocument, surveyDocumentSchema } from "survey-engine";
import { z } from "zod";

export interface SurveyResource {
  document: SurveyDocument;
  settings: SurveySettings;
}

// The document's save check: every issue the survey check reports is refused at the field it names. The check walks a
// Document the schema parsed whole, so it runs only where the schema raised no issue
const surveyDocumentWithCheckSchema = surveyDocumentSchema.superRefine(
  (document, context) => {
    for (const { message, pointer } of checkSurveyDocument(document))
      context.addIssue({ code: "custom", message, path: parseJsonPointer(pointer) });
  },
  { when: ({ issues }) => issues.length === 0 },
);

// Strict, so a save still holding the retired model string is refused. The resource's size limit applies to the whole
// Content on every write, not to this schema
export const surveyResourceSchema = z.strictObject({
  document: surveyDocumentWithCheckSchema,
  settings: surveySettingsSchema,
}) satisfies z.ZodType<ToData<SurveyResource>>;
