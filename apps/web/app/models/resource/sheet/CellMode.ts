export const CellMode = { Edit: "Edit", Select: "Select", View: "View" } as const;
export type CellMode = (typeof CellMode)[keyof typeof CellMode];
