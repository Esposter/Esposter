import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyRootProps } from "#src/models/SurveyRootProps";
import type { BlockDocumentInput } from "headless-block-editor";
import type { z } from "zod";

import { MAX_SURVEY_NODE_COUNT } from "#src/services/constants";
import { surveyPageNodeSchema } from "#src/services/surveyNodeSchema";
import { surveyNodeChildren } from "#src/services/surveyNodeChildren";
import { surveyRegistry } from "#src/services/surveyRegistry";
import { createBlockDocumentSchema } from "headless-block-editor";

// A survey document: its root takes pages only, so the schema an agent reads lists exactly that
// Refused on a duplicate id, a node a slot does not allow, props its type refuses, or too many nodes
export const surveyDocumentSchema: z.ZodType<SurveyDocument, BlockDocumentInput> = createBlockDocumentSchema<
  SurveyNode,
  SurveyRootProps
>(surveyPageNodeSchema, surveyRegistry, surveyNodeChildren, MAX_SURVEY_NODE_COUNT);
