import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

import { checkSurveyOptionalExpression } from "#src/services/checkSurveyOptionalExpression";
import { getBlockPropPointer } from "vue-block-editor-headless";

// The enable condition a page or a panel holds, pointed at the node's own prop
export const checkSurveyEnableIf = (enableIf: string, nodePointer: string, issues: SurveyDocumentIssue[]): void => {
  checkSurveyOptionalExpression(enableIf, "enable condition", getBlockPropPointer(nodePointer, "enableIf"), issues);
};
