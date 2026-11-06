import type { Panel } from "#src/models/Panel";

// The content key a panel shows for a selection kind: its entry for the kind when its table has one, its wildcard otherwise, and "" when it has neither
export const getPanelContentKey = (panel: Panel, selectionKind: string): string => {
  // An entry is read only as an own key of the table, so a kind named like a member every object inherits has no entry
  const kindContentKey = Object.hasOwn(panel.selectionKindContentKeyMap, selectionKind)
    ? panel.selectionKindContentKeyMap[selectionKind]
    : "";
  return kindContentKey || panel.wildcardContentKey;
};
