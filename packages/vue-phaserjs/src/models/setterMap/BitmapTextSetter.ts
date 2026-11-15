export const BitmapTextSetter = {
  Align: "align",
  DropShadow: "dropShadow",
  Font: "font",
  FontSize: "fontSize",
  LetterSpacing: "letterSpacing",
  LineSpacing: "lineSpacing",
  MaxWidth: "maxWidth",
  Text: "text",
  WordWrapCharCode: "wordWrapCharCode",
} as const;
export type BitmapTextSetter = (typeof BitmapTextSetter)[keyof typeof BitmapTextSetter];
