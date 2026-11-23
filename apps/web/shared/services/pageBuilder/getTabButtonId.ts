import type { TabNode } from "#shared/models/pageBuilder/TabNode";

// The id of a tab's button. The Tabs node writes it onto the button, and the panel it labels names it back, so both
// Read it here
export const getTabButtonId = (tab: TabNode): string => `${tab.props.id}-tab`;
