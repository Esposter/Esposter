import type { SurveyDocument } from "#src/models/SurveyDocument";
import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyLogicContext } from "survey-expression";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNodeVisible } from "#src/services/runner/checkSurveyNodeVisible";
import { getSurveyElementViews } from "#src/services/runner/getSurveyElementViews";
import { getBlockPropPointer } from "vue-block-editor-headless";

// The views of the page at an index: none when the index names no page or the page is hidden, and otherwise the views of its elements
export const getSurveyPageViews = (
  document: SurveyDocument,
  pageIndex: number,
  values: SurveyLogicContext["values"],
  now: Date,
): SurveyElementView[] => {
  const page = document.content.at(pageIndex);
  if (page?.type !== SurveyNodeType.Page || !checkSurveyNodeVisible(page, values, now)) return [];

  return getSurveyElementViews(
    page.props.children,
    getBlockPropPointer(`/content/${pageIndex}`, "children"),
    values,
    now,
    true,
  );
};
