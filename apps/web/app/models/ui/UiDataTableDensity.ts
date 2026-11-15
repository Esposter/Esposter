// How much room a data table's rows take: comfortable, its padding, or compact, half of it above and below, so more
// Rows fit on a screen
export const UiDataTableDensity = { Comfortable: "Comfortable", Compact: "Compact" } as const;
export type UiDataTableDensity = (typeof UiDataTableDensity)[keyof typeof UiDataTableDensity];
