// How wide a dialog stands, from Small to Full. The base dialog owns each width, so a call site names a size rather
// Than A width literal of its own
export const UiDialogSize = {
  ExtraLarge: "ExtraLarge",
  Full: "Full",
  Large: "Large",
  Medium: "Medium",
  Small: "Small",
} as const;
export type UiDialogSize = (typeof UiDialogSize)[keyof typeof UiDialogSize];
