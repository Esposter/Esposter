import type { Panel } from "#src/models/Panel";

// The content key a panel shows for a selection kind: its own entry for the kind, otherwise its wildcard.
// It is "" when the panel has neither
export const getPanelContentKey = (panel: Panel, selectionKind: string): string => {
  // An entry is read only as an own key of the table, so a kind named like a member every object inherits has no entry
  const kindContentKey = Object.hasOwn(panel.selectionKindContentKeyMap, selectionKind)
    ? panel.selectionKindContentKeyMap[selectionKind]
    : "";
  return kindContentKey || panel.wildcardContentKey;
};
