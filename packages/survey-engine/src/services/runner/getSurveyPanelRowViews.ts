import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyPanelRowView } from "#src/models/SurveyPanelRowView";
import type { SurveyLogicContext } from "survey-logic";

import { checkSurveyNodeEnabled } from "#src/services/runner/checkSurveyNodeEnabled";
import { checkSurveyNodeRequired } from "#src/services/runner/checkSurveyNodeRequired";
import { checkSurveyNodeVisible } from "#src/services/runner/checkSurveyNodeVisible";
import { toSurveyPanelScope } from "#src/services/runner/toSurveyPanelScope";

// The template questions a row shows, in template order, each with whether the row enables it and requires it
// A question its visibleIf hides is absent, and one its enableIf disables is present but not enabled, as a question on a page is
// The row's own answers are the panel scope each condition reads, beside the survey's values
export const getSurveyPanelRowViews = (
  node: SurveyPanelDynamicNode,
  row: Record<string, SurveyAnswerValue | undefined>,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyPanelRowView[] => {
  const scopes = { panel: toSurveyPanelScope(row) };
  return node.props.template.flatMap((question) =>
    checkSurveyNodeVisible(question, values, now, scopes)
      ? [
          {
            isEnabled: checkSurveyNodeEnabled(question, values, now, scopes),
            isRequired: checkSurveyNodeRequired(question, values, now, scopes),
            node: question,
          },
        ]
      : [],
  );
};
