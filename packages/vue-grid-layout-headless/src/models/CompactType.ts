// The direction a layout compacts in: vertical rises items to the top, horizontal moves them to the left, and none leaves
// Each item where it was placed
export const CompactType = { Horizontal: "Horizontal", None: "None", Vertical: "Vertical" } as const;
export type CompactType = (typeof CompactType)[keyof typeof CompactType];
