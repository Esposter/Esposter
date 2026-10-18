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
export const readGcsimAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimAttack[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  return sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const aliasMap = readGoAliases(tokens);
    const attacks: GcsimAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.text !== "AttackInfo" || !checkIsGoPunctuation(tokens[position + 1], "{")) continue;
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
      attacks.push({
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
        talentVariable:
          multiplierField === undefined
            ? undefined
            : resolveGoAlias(aliasMap, getGoRootName(multiplierField.expression), position),
        variableName: readVariableName(tokens, position),
      });
    }
    // A `Mult` the code sets after a literal, `ai.Mult = burstFinal[...]`, is that literal's attack under the variable it
    // Names: the nearest literal of the same name before it, its fields as written, its multiplier as set here
    for (const [position, token] of tokens.entries()) {
      if (
        token.text !== "Mult" ||
        !checkIsGoPunctuation(tokens[position - 1], ".") ||
        !checkIsGoPunctuation(tokens[position + 1], "=") ||
        tokens[position - 2]?.kind !== GoTokenKind.Identifier
      )
        continue;
      const variableName = tokens[position - 2]?.text;
      const literal = attacks.filter(
        (attack) => attack.file === file && attack.variableName === variableName && attack.line < token.line,
      );
      const talentVariable = resolveGoAlias(
        aliasMap,
        getGoRootName(parseGoExpression(tokens, position + 2).expression),
        position,
      );
      const literalAttack = literal.at(-1);
      if (literalAttack === undefined || talentVariable === undefined) continue;
      attacks.push({
        ...literalAttack,
        fieldLineMap: { ...literalAttack.fieldLineMap, Mult: token.line },
        line: token.line,
        talentVariable,
      });
    }
    return attacks;
  });
};
