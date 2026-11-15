// What a token of a Lua table literal is: punctuation, a name, a number or a quoted string
export const LuaTokenKind = { Name: "name", Number: "number", Punctuation: "punctuation", String: "string" } as const;
export type LuaTokenKind = (typeof LuaTokenKind)[keyof typeof LuaTokenKind];
