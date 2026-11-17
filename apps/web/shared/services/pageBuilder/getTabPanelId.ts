import type { TabNode } from "#shared/models/pageBuilder/TabNode";

// The id of a tab's panel, which the tab's button controls. A tab with an element id is its panel's id, which the renderer writes onto the panel as well
export const getTabPanelId = (tab: TabNode): string => tab.props.elementId || `${tab.props.id}-panel`;
