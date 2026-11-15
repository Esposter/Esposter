// A collapsible's look beyond the default, for one that heads a sector of a panel: its open trigger is drawn in the full
// Text colour under a heavier indicator, as the selected tab of a row of header tabs is
export const UiCollapsibleVariant = { Header: "Header" } as const;
export type UiCollapsibleVariant = (typeof UiCollapsibleVariant)[keyof typeof UiCollapsibleVariant];
