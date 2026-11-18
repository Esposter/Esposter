import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A value a Lua table literal holds: a string, a number, a boolean or a table, which is an object when it names its fields
// And an array when it lists its values
export type LuaValue = boolean | LuaValue[] | number | string | { [field: string]: LuaValue };

// One token of the literal: punctuation, a name, a number or a quoted string, each with its text. Comments and spaces
// Are skipped
const TOKEN_REGEX =
  /\s+|--[^\n]*|(?<punctuation>[{}=,;[\]])|(?<quoted>'[^']*'|"[^"]*")|(?<number>-?\d+(?:\.\d+)?)|(?<name>[A-Za-z_]\w*)/guy;

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

// A field's name, whether it is written as a name or as a quoted name in brackets, consumed with its `=`, or none when
// The next value is positional
const readFieldName = (tokens: readonly LuaToken[], index: number): undefined | { name: string; next: number } => {
  const [first, second, third, fourth] = tokens.slice(index, index + 4);
  if (first?.kind === LuaTokenKind.Name && checkIsPunctuation(second, "="))
    return { name: first.text, next: index + 2 };
  if (
    checkIsPunctuation(first, "[") &&
    second?.kind === LuaTokenKind.String &&
    checkIsPunctuation(third, "]") &&
    checkIsPunctuation(fourth, "=")
  )
    return { name: second.text, next: index + 4 };
  return undefined;
};

// Reads a Lua table literal, as the wiki's data modules write it, into the values it holds: named fields as an object,
// Listed values as an array, and nothing else. A table that names fields and also lists values keeps each listed value
// Under its index, as Lua stores it, so the two read together. An escape in a string, and any text after the literal's
// Closing brace, are refused, since no module the wiki's data uses escapes one
export const parseLuaTable = (source: string): LuaValue => {
  const tokens = tokenize(source);
  let index = 0;
  const readValue = (): LuaValue => {
    const token = tokens[index++];
    if (token?.kind === LuaTokenKind.Number) return Number(token.text);
    if (token?.kind === LuaTokenKind.Name && (token.text === "true" || token.text === "false"))
      return token.text === "true";
    if (token?.kind === LuaTokenKind.String) {
      if (token.text.includes("\\")) throw new InvalidOperationError(Operation.Read, token.text, "has an escape");
      return token.text;
    }
    if (!checkIsPunctuation(token, "{"))
      throw new InvalidOperationError(
        Operation.Read,
        "a Lua table",
        "has a value that is no table, string, number or boolean",
      );
    const fields: Record<string, LuaValue> = {};
    const values: LuaValue[] = [];
    while (!checkIsPunctuation(tokens[index], "}")) {
      const field = readFieldName(tokens, index);
      if (field) {
        index = field.next;
        fields[field.name] = readValue();
      } else values.push(readValue());
      if (checkIsPunctuation(tokens[index], ",") || checkIsPunctuation(tokens[index], ";")) index++;
      else if (!checkIsPunctuation(tokens[index], "}"))
        throw new InvalidOperationError(Operation.Read, "a Lua table", "is not closed");
    }
    index++;
    if (Object.keys(fields).length === 0) return values;
    return Object.fromEntries([
      ...values.map((value, position): [string, LuaValue] => [String(position + 1), value]),
      ...Object.entries(fields),
    ]);
  };
  if (tokens[0]?.kind === LuaTokenKind.Name && tokens[0].text === "return") index++;
  const value = readValue();
  if (index !== tokens.length)
    throw new InvalidOperationError(Operation.Read, "a Lua table", "has text after its closing brace");
  return value;
};
