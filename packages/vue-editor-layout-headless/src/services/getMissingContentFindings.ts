import type { Finding } from "#src/models/Finding";
import type { Layout } from "#src/models/Layout";

import { FindingKind } from "#src/models/FindingKind";
import { checkIsListMatch } from "#src/services/checkIsListMatch";
import { getPanelContentKey } from "#src/services/getPanelContentKey";

// The finding for each selection kind that no panel shows content for. A panel covers a kind when its condition admits the kind
// And its table gives the kind a content key, its wildcard included. The mode and the tool are not read, since the check takes
// No context, so a kind covered under only one tool counts as covered
export const getMissingContentFindings = (layout: Layout, selectionKinds: string[]): Finding[] => {
  const uncoveredSelectionKinds = selectionKinds.filter(
    (selectionKind) =>
      !layout.panels.some(
        (panel) =>
          checkIsListMatch(panel.condition.selectionKinds, selectionKind) &&
          Boolean(getPanelContentKey(panel, selectionKind)),
      ),
  );
  return uncoveredSelectionKinds.map((selectionKind) => ({ kind: FindingKind.MissingContent, subject: selectionKind }));
};
