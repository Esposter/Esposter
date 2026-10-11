import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const checkIsPunctuation = (token: GoToken | undefined, text: string): boolean =>
  token?.kind === GoTokenKind.Punctuation && token.text === text;

// The name an expression is rooted in, `attack` for `attack[c.NormalCounter][i]`
const getRootName = (expression: GoExpression): string | undefined => {
  if (expression.kind === GoExpressionKind.Identifier) return expression.name;
  else if (expression.kind === GoExpressionKind.Index) return getRootName(expression.target);
  return undefined;
};

const getName = (expression: GoExpression | undefined): string | undefined =>
  expression?.kind === GoExpressionKind.Identifier ? expression.name : undefined;

// The locals of a file that name a slice of another name, `for i, mult := range attack[c.NormalCounter]` or
// `mult := attack[0]`, each by the name it is rooted in
const readAliases = (tokens: readonly GoToken[]): Map<string, string> => {
  const aliasMap = new Map<string, string>();
  for (const [position, token] of tokens.entries()) {
    if (!checkIsPunctuation(token, ":=")) continue;
    const isRange = tokens[position + 1]?.text === "range";
    const { expression } = parseGoExpression(tokens, position + (isRange ? 2 : 1));
    const rootName = getRootName(expression);
    const name = tokens[position - 1]?.text;
    if (rootName !== undefined && name !== undefined && tokens[position - 1]?.kind === GoTokenKind.Identifier)
      aliasMap.set(name, rootName);
  }
  return aliasMap;
};

// The `AttackInfo` literals of a gcsim character's action files, each field read from the literal as written: its tags,
// Strike type and element by their gcsim names, its durability and poise evaluated through the package's constants, and
// The talent variable its multiplier is rooted in, followed through the locals naming a slice of it. A field the code
// Sets after the literal is not read
export const readGcsimAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
): GcsimAttack[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  return sources.flatMap(({ name: file, source }) => {
    const tokens = tokenizeGo(source);
    const aliasMap = readAliases(tokens);
    const resolveAlias = (name: string | undefined): string | undefined => {
      let resolved = name;
      for (let depth = 0; resolved !== undefined && aliasMap.has(resolved) && depth < 8; depth++)
        resolved = aliasMap.get(resolved);
      return resolved;
    };
    const attacks: GcsimAttack[] = [];
    for (const [position, token] of tokens.entries()) {
      if (token.text !== "AttackInfo" || !checkIsPunctuation(tokens[position + 1], "{")) continue;
      const fieldMap = new Map<string, { expression: GoExpression; line: number }>();
      let cursor = position + 2;
      while (cursor < tokens.length && !checkIsPunctuation(tokens[cursor], "}")) {
        const keyToken = tokens[cursor];
        if (keyToken?.kind === GoTokenKind.Identifier && checkIsPunctuation(tokens[cursor + 1], ":")) {
          const { end, expression } = parseGoExpression(tokens, cursor + 2);
          fieldMap.set(keyToken.text, { expression, line: keyToken.line });
          cursor = end;
        } else cursor++;
      }
      const evaluateNumber = (key: string): number | undefined => {
        const field = fieldMap.get(key);
        const value = field === undefined ? undefined : evaluateGoExpression(field.expression, resolveName);
        return typeof value === "number" ? value : undefined;
      };
      const multiplier = fieldMap.get("Mult");
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
          poiseDamage === undefined && poiseField !== undefined ? getRootName(poiseField.expression) : undefined,
        strikeType: getName(fieldMap.get("StrikeType")?.expression),
        talentVariable: multiplier === undefined ? undefined : resolveAlias(getRootName(multiplier.expression)),
      });
    }
    return attacks;
  });
};
