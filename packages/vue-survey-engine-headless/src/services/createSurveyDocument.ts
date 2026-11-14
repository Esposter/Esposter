import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { surveyRootPropsSchema } from "#src/models/SurveyRootProps";
import { surveyPageNodeType } from "#src/services/surveyPageNodeType";
import { v7 } from "uuid";

// The empty survey: one page with no nodes and the root's defaults, which a new survey and a cleared one both start from
// Each call takes a fresh page id, so two surveys never share one
export const createSurveyDocument = (): SurveyDocument => {
  const page: SurveyPageNode = {
    props: { ...surveyPageNodeType.createDefaultProps(), children: [], id: v7() },
    type: SurveyNodeType.Page,
  };
  return { content: [page], root: { props: surveyRootPropsSchema.parse({}) } };
};
