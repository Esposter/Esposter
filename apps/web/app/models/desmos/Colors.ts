// The `Desmos.Colors` the expressions here name, so an expression list built before the script loads can still name one
export const Colors = { Black: "#000000", Red: "#c74440" } as const;
export type Colors = (typeof Colors)[keyof typeof Colors];
