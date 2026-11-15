export const RowValueType = { Image: "Image", Text: "Text", Textarea: "Textarea" } as const;
export type RowValueType = (typeof RowValueType)[keyof typeof RowValueType];
