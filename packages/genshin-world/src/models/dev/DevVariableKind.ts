// The kind a variable's text is read as, and so the values its control and its console line accept
export const DevVariableKind = { Boolean: "boolean", Choice: "choice", Colour: "colour", Number: "number" } as const;
export type DevVariableKind = (typeof DevVariableKind)[keyof typeof DevVariableKind];
