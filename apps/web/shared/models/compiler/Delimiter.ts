export const Delimiter = { CurlyBraces: "CurlyBraces" } as const;
export type Delimiter = (typeof Delimiter)[keyof typeof Delimiter];
