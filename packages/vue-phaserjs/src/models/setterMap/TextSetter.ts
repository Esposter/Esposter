export const TextSetter = { Padding: "padding", Style: "style", Text: "text" } as const;
export type TextSetter = (typeof TextSetter)[keyof typeof TextSetter];
