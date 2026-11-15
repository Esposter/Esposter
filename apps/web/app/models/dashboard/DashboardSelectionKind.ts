// What a dashboard editor selection is, as its layout's panels name it. Nothing selected is the empty kind the layout reads
// As "", so it has no member here
export const DashboardSelectionKind = { Group: "group", Visual: "visual" } as const;
export type DashboardSelectionKind = (typeof DashboardSelectionKind)[keyof typeof DashboardSelectionKind];
