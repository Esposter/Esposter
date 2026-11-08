import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A value a Lua table literal holds: a string, a number or a table, which is an object when it names its fields and an
// Array when it lists its values
export type LuaValue = LuaValue[] | number | string | { [field: string]: LuaValue };

// One token of the literal: punctuation, a name, a number or a quoted string, each with its text. Comments and spaces
// Are skipped
const TOKEN_REGEX =
  /\s+|--[^\n]*|(?<punctuation>[{}=,;])|(?<quoted>'[^']*'|"[^"]*")|(?<number>-?\d+(?:\.\d+)?)|(?<name>[A-Za-z_]\w*)/guy;

interface LuaToken {
  kind: LuaTokenKind;
  text: string;
}

const tokenize = (source: string): LuaToken[] => {
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

// Whether a token is the punctuation the literal's syntax names at that point, so a string that spells it is not
const checkIsPunctuation = (token: LuaToken | undefined, text: string): boolean =>
  token?.kind === LuaTokenKind.Punctuation && token.text === text;

// Reads a Lua table literal, as the wiki's data modules write it, into the values it holds: named fields as an object,
// Listed values as an array, and nothing else. A table naming some fields and listing others is refused, as is an
// Escape in a string, and any text after the literal's closing brace, since no module the wiki's data uses escapes one
export const parseLuaTable = (source: string): LuaValue => {
  const tokens = tokenize(source);
  let index = 0;
  const readValue = (): LuaValue => {
    const token = tokens[index++];
    if (token?.kind === LuaTokenKind.Number) return Number(token.text);
    if (token?.kind === LuaTokenKind.String) {
      if (token.text.includes("\\")) throw new InvalidOperationError(Operation.Read, token.text, "has an escape");
      return token.text;
    }
    if (!checkIsPunctuation(token, "{"))
      throw new InvalidOperationError(Operation.Read, "a Lua table", "has a value that is no table, string or number");
    const fields: Record<string, LuaValue> = {};
    const values: LuaValue[] = [];
    while (!checkIsPunctuation(tokens[index], "}")) {
      const next = tokens[index];
      if (next?.kind === LuaTokenKind.Name && checkIsPunctuation(tokens[index + 1], "=")) {
        index += 2;
        fields[next.text] = readValue();
      } else values.push(readValue());
      if (checkIsPunctuation(tokens[index], ",") || checkIsPunctuation(tokens[index], ";")) index++;
      else if (!checkIsPunctuation(tokens[index], "}"))
        throw new InvalidOperationError(Operation.Read, "a Lua table", "is not closed");
    }
    index++;
    if (Object.keys(fields).length > 0 && values.length > 0)
      throw new InvalidOperationError(Operation.Read, "a Lua table", "mixes named fields and positional values");
    return Object.keys(fields).length > 0 ? fields : values;
  };
  if (tokens[0]?.kind === LuaTokenKind.Name && tokens[0].text === "return") index++;
  const value = readValue();
  if (index !== tokens.length)
    throw new InvalidOperationError(Operation.Read, "a Lua table", "has text after its closing brace");
  return value;
};
