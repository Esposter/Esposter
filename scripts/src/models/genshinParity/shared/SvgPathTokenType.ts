// What a token of a compacted path is, which decides whether it needs a space before it
export const SvgPathTokenType = { Flag: "flag", Letter: "letter", Number: "number" } as const;
export type SvgPathTokenType = (typeof SvgPathTokenType)[keyof typeof SvgPathTokenType];
