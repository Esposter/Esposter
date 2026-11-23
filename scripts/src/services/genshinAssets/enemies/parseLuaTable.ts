import { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";
import { checkIsPunctuation } from "#src/services/genshinAssets/enemies/checkIsPunctuation";
import { readFieldName } from "#src/services/genshinAssets/enemies/readFieldName";
import { tokenizeLuaTable } from "#src/services/genshinAssets/enemies/tokenizeLuaTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A value a Lua table literal holds: a string, a number, a boolean or a table, which is an object when it names its
// Fields And an array when it lists its values
type LuaValue = { [field: string]: LuaValue } | boolean | LuaValue[] | number | string;

// Reads a Lua table literal, as the wiki's data modules write it, into the values it holds: named fields as an object,
// Listed values as an array, and nothing else. A table that names fields and also lists values keeps each listed value
// Under its index, as Lua stores it, so the two read together. An escape in a string, and any text after the literal's
// Closing brace, are refused, since no module the wiki's data uses escapes one
export const parseLuaTable = (source: string): LuaValue => {
  const tokens = tokenizeLuaTable(source);
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
