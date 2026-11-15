export const PasteMode = { Overwrite: "Overwrite", ShiftDown: "ShiftDown" } as const;
export type PasteMode = (typeof PasteMode)[keyof typeof PasteMode];
