// The dialects a command can read a chunk in, by the name a command line gives them
export const LuaDialectName = { Genshin: "genshin", Stock: "stock" } as const;
export type LuaDialectName = (typeof LuaDialectName)[keyof typeof LuaDialectName];
