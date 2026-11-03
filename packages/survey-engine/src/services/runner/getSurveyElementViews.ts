import type { SurveyElementView } from "#src/models/SurveyElementView";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";
import type { SurveyLogicContext } from "survey-logic";

import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyNodeEnabled } from "#src/services/runner/checkSurveyNodeEnabled";
import { checkSurveyNodeRequired } from "#src/services/runner/checkSurveyNodeRequired";
import { checkSurveyNodeVisible } from "#src/services/runner/checkSurveyNodeVisible";
import { getBlockPropPointer } from "headless-block-editor";

// The views of a list of nodes, each at its pointer under the list's pointer. A hidden node is absent
// A panel is absent too when none of its elements is shown, since a panel shows only what it holds
// A node under a disabled panel is disabled as well
export const getSurveyElementViews = (
  nodes: SurveyPlaceableNode[],
  listPointer: string,
  values: SurveyLogicContext["values"],
  now: Date,
  isParentEnabled: boolean,
): SurveyElementView[] =>
  nodes.flatMap((node, index) => {
    const pointer = `${listPointer}/${index}`;
    if (!checkSurveyNodeVisible(node, values, now)) return [];

    const isEnabled = isParentEnabled && checkSurveyNodeEnabled(node, values, now);
    const children =
      node.type === SurveyNodeType.Panel
        ? getSurveyElementViews(node.props.children, getBlockPropPointer(pointer, "children"), values, now, isEnabled)
        : [];
    if (node.type === SurveyNodeType.Panel && children.length === 0) return [];

    return [{ children, isEnabled, isRequired: checkSurveyNodeRequired(node, values, now), node, pointer }];
  });
