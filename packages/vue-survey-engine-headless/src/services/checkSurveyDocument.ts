import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyDocumentIssue } from "#src/models/SurveyDocumentIssue";

import { checkSurveyCalculatedValues } from "#src/services/checkSurveyCalculatedValues";
import { checkSurveyNodes } from "#src/services/checkSurveyNodes";

// The save check of a parsed survey. It returns every refusal in document order rather than the first
// The calculated values come after the pages, so a value's name is checked against every question name the walk has collected
export const checkSurveyDocument = (document: SurveyDocument): SurveyDocumentIssue[] => {
  const issues: SurveyDocumentIssue[] = [];
  const names = new Set<string>();
  checkSurveyNodes(document.content, "/content", names, issues);
  checkSurveyCalculatedValues(document.root.props.calculatedValues, "/root/props/calculatedValues", names, issues);
  return issues;
};
