// The evidence log beside the ward mod's records, under the person's home folder, so every session on the machine reads it
export const getSinsStorePath = (home: string): string => `${home}/.claude/genshin-mods/sins.sqlite`;
