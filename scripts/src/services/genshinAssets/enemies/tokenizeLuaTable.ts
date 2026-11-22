import type { LuaToken } from "#src/models/genshinAssets/enemies/LuaToken";

import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One token of the literal: punctuation, a name, a number or a quoted string, each with its text. Comments and spaces
// Are skipped
const TOKEN_REGEX =
  /\s+|--[^\n]*|(?<punctuation>[{}=,;[\]])|(?<quoted>'[^']*'|"[^"]*")|(?<number>-?\d+(?:\.\d+)?)|(?<name>[A-Za-z_]\w*)/guy;

export const tokenizeLuaTable = (source: string): LuaToken[] => {
  const tokens: LuaToken[] = [];
  let position = 0;
  while (position < source.length) {
    TOKEN_REGEX.lastIndex = position;
    const match = TOKEN_REGEX.exec(source);
    if (!match)
      throw new InvalidOperationError(Operation.Read, "a Lua table", `has an unreadable character at ${position}`);
    position = TOKEN_REGEX.lastIndex;
    const [text] = match;
    const { name, number, punctuation, quoted } = match.groups ?? {};
    if (punctuation !== undefined) tokens.push({ kind: LuaTokenKind.Punctuation, text: punctuation });
    else if (quoted !== undefined) tokens.push({ kind: LuaTokenKind.String, text: quoted.slice(1, -1) });
    else if (number !== undefined) tokens.push({ kind: LuaTokenKind.Number, text: number });
    else if (name !== undefined) tokens.push({ kind: LuaTokenKind.Name, text });
  }
  return tokens;
};
