// A row of tabs' look beyond the default, for a set of tabs that heads a sheet or a pane: its selected tab is drawn in
// The full text colour under a heavier indicator, so the one open is clear at a glance
export const UiTabsVariant = { Header: "Header" } as const;
export type UiTabsVariant = (typeof UiTabsVariant)[keyof typeof UiTabsVariant];
