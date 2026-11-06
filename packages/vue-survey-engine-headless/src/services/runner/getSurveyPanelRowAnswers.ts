import type { SurveyAnswers } from "#src/models/SurveyAnswers";
import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyLogicContext } from "survey-expression";

import { getSurveyPanelRowViews } from "#src/services/runner/getSurveyPanelRowViews";

// A row's answers without the answers to the template questions the row does not show, as a completed survey drops a hidden answer
export const getSurveyPanelRowAnswers = (
  node: SurveyPanelDynamicNode,
  row: SurveyAnswers,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyAnswers => {
  const shownNames = new Set(getSurveyPanelRowViews(node, row, values, now).map((view) => view.node.props.name));
  return Object.fromEntries(Object.entries(row).filter(([name]) => shownNames.has(name)));
};
