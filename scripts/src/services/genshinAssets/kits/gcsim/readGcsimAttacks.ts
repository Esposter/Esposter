import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readGoAliases, resolveGoAlias } from "#src/services/genshinAssets/kits/gcsim/readGoAliases";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { skipGoBrackets } from "#src/services/genshinAssets/kits/gcsim/skipGoBrackets";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const getName = (expression: GoExpression | undefined): string | undefined =>
  expression?.kind === GoExpressionKind.Identifier ? expression.name : undefined;

// The name a literal at the position is given to, by `:=` or `=`, `ai := info.AttackInfo{` or `c.skillAttackInfo =
// Info.AttackInfo{`, read back past its qualified type. A literal a function returns takes that function's name, as a
// Helper's does, `return info.AttackInfo{` in `func (c *char) a1AttackInfo()`
const readVariableName = (tokens: readonly GoToken[], position: number): string | undefined => {
  let start = position;
  while (checkIsGoPunctuation(tokens[start - 1], ".") && tokens[start - 2]?.kind === GoTokenKind.Identifier) start -= 2;
  if (tokens[start - 1]?.text === "return") return readFunctionName(tokens, start - 1);
  return (checkIsGoPunctuation(tokens[start - 1], ":=") || checkIsGoPunctuation(tokens[start - 1], "=")) &&
    tokens[start - 2]?.kind === GoTokenKind.Identifier
    ? tokens[start - 2]?.text
    : undefined;
};

// The name of the nearest function before the position, `a1AttackInfo` in `func (c *char) a1AttackInfo() info.AttackInfo {`
const readFunctionName = (tokens: readonly GoToken[], position: number): string | undefined => {
  let start = position;
  while (start >= 0 && tokens[start]?.text !== "func") start--;
  if (start < 0) return undefined;
  const nameStart = checkIsGoPunctuation(tokens[start + 1], "(") ? skipGoBrackets(tokens, start + 1) : start + 1;
  // A declaration's name opens its parameters; a closure's `func() info.AttackInfo {` has its result type there instead
  return tokens[nameStart]?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[nameStart + 1], "(")
    ? tokens[nameStart]?.text
    : undefined;
};

// The `AttackInfo` literals of a gcsim character's action files, each field read from the literal as written: its tags,
// Strike type and element by their gcsim names, its durability and poise evaluated through the package's constants, and
// The talent variable its multiplier is rooted in, followed through the locals naming a slice of it. A field the code
// Sets after the literal is not read, but a `Mult` it sets after the literal is an attack of its own under that variable
// The string each name of a file is set to, `c6Abil = "Boundless Origin (C6)"`, as an `Abil` names an attack by a constant
const readGoStringConstants = (tokens: readonly GoToken[]): Map<string, string> => {
  const stringMap = new Map<string, string>();
  for (const [position, token] of tokens.entries()) {
    const value = tokens[position + 2];
    if (
      token.kind === GoTokenKind.Identifier &&
      checkIsGoPunctuation(tokens[position + 1], "=") &&
      value?.kind === GoTokenKind.String
    )
      stringMap.set(token.text, value.text.slice(1, -1));
  }
  return stringMap;
};

// Whether the tokens at the position are a struct copy of an attack variable, `aiC2 = ai` or `aiC2 := ai`, its source
// Name ending its statement, which a `.` or a call or index on it would not
const readCopySource = (tokens: readonly GoToken[], position: number): string | undefined => {
  const source = tokens[position + 2];
  const isCopy =
    tokens[position]?.kind === GoTokenKind.Identifier &&
    !checkIsGoPunctuation(tokens[position - 1], ".") &&
    (checkIsGoPunctuation(tokens[position + 1], "=") || checkIsGoPunctuation(tokens[position + 1], ":=")) &&
    source?.kind === GoTokenKind.Identifier &&
    source.line === tokens[position]?.line &&
    (tokens[position + 3] === undefined || tokens[position + 3]?.kind === GoTokenKind.Newline);
  return isCopy ? source.text : undefined;
};

// The `AttackInfo` literals of a gcsim character's action files, each field read from the literal as written: its tags,
// Strike type and element by their gcsim names, its durability and poise evaluated through the package's constants, and
// The talent variable its multiplier is rooted in, followed through the locals naming a slice of it. The code reads in
// Source order, so an attack is the literal or copy its variable names as of the line: a `Mult` the code sets after a
// Literal is an attack of its own under the variable it names, and a copy `aiC2 = ai` is the source as of the copy with
// Its later sets, its site the copy's own line, not the literal's
export const readGcsimAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimAttack[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  return sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const aliasMap = readGoAliases(tokens);
    const stringMap = readGoStringConstants(tokens);
    const attacks: GcsimAttack[] = [];
    const readVariableAttack = (variableName: string, line: number) =>
      attacks.filter((attack) => attack.variableName === variableName && attack.line < line).at(-1);
    for (const [position, token] of tokens.entries()) {
      if (token.text === "AttackInfo" && checkIsGoPunctuation(tokens[position + 1], "{")) {
        // A function's result type, `func (c *char) a1AttackInfo() info.AttackInfo {`, opens its body rather than a literal
        const typeStart = checkIsGoPunctuation(tokens[position - 1], ".") ? position - 2 : position;
        if (checkIsGoPunctuation(tokens[typeStart - 1], ")")) continue;
        const fieldMap = new Map<string, { expression: GoExpression; line: number }>();
        let cursor = position + 2;
        while (cursor < tokens.length && !checkIsGoPunctuation(tokens[cursor], "}")) {
          const keyToken = tokens[cursor];
          if (keyToken?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[cursor + 1], ":")) {
            const { end, expression } = parseGoExpression(tokens, cursor + 2);
            fieldMap.set(keyToken.text, { expression, line: keyToken.line });
            cursor = end;
          } else cursor++;
        }
        const evaluateNumber = (key: string): number | undefined => {
          const field = fieldMap.get(key);
          return readGoNumber(field === undefined ? undefined : evaluateGoExpression(field.expression, resolveName));
        };
        const multiplierField = fieldMap.get("Mult");
        const poiseDamage = evaluateNumber("PoiseDMG");
        const poiseField = fieldMap.get("PoiseDMG");
        const abilExpression = fieldMap.get("Abil")?.expression;
        attacks.push({
          abil:
            abilExpression?.kind === GoExpressionKind.String
              ? abilExpression.value
              : getName(abilExpression) === undefined
                ? undefined
                : stringMap.get(getName(abilExpression) ?? ""),
          attackTag: getName(fieldMap.get("AttackTag")?.expression),
          durability: evaluateNumber("Durability"),
          element: getName(fieldMap.get("Element")?.expression),
          fieldLineMap: Object.fromEntries(Array.from(fieldMap, ([key, { line }]) => [key, line])),
          file,
          internalCooldownTag: getName(fieldMap.get("ICDTag")?.expression),
          line: token.line,
          poiseDamage,
          poiseDamageVariable:
            poiseDamage === undefined && poiseField !== undefined ? getGoRootName(poiseField.expression) : undefined,
          siteLine: token.line,
          talentVariable:
            multiplierField === undefined
              ? undefined
              : resolveGoAlias(aliasMap, getGoRootName(multiplierField.expression), position),
          variableName: readVariableName(tokens, position),
        });
      } else if (
        token.text === "Mult" &&
        checkIsGoPunctuation(tokens[position - 1], ".") &&
        checkIsGoPunctuation(tokens[position + 1], "=") &&
        tokens[position - 2]?.kind === GoTokenKind.Identifier
      ) {
        const literalAttack = readVariableAttack(tokens[position - 2]?.text ?? "", token.line);
        const talentVariable = resolveGoAlias(
          aliasMap,
          getGoRootName(parseGoExpression(tokens, position + 2).expression),
          position,
        );
        if (literalAttack === undefined || talentVariable === undefined) continue;
        attacks.push({
          ...literalAttack,
          fieldLineMap: { ...literalAttack.fieldLineMap, Mult: token.line },
          line: token.line,
          talentVariable,
        });
      } else {
        const copySource = readCopySource(tokens, position);
        const sourceAttack = copySource === undefined ? undefined : readVariableAttack(copySource, token.line);
        if (sourceAttack === undefined) continue;
        attacks.push({ ...sourceAttack, line: token.line, siteLine: token.line, variableName: token.text });
      }
    }
    return attacks;
  });
};
