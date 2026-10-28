import type { FieldWrite } from "#src/models/genshinAssets/kits/gcsim/FieldWrite";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { toGoNumberValue } from "#src/services/genshinAssets/kits/gcsim/toGoNumberValue";

const ARITHMETIC_OPERATORS = new Set(["%", "&", "*", "+", "-", "/", "<", ">", "^", "|"]);
// The qualified names gcsim's internal cooldown tags are written as, `attacks.ICDTagNone` among them
const COOLDOWN_TAG_PREFIX = "attacks.ICDTag";

// Each write to a field of `c` in a file: a literal `=` gives its value, an increment or `op=` gives none, and a read like
// `c.field == 2` is no write at all
export const readFieldWrites = (
  tokens: readonly GoToken[],
  file: string,
  fieldWriteMap: Map<string, FieldWrite[]>,
): void => {
  for (const [position, token] of tokens.entries()) {
    if (token.kind !== GoTokenKind.Identifier || token.text !== "c" || checkIsGoPunctuation(tokens[position - 1], "."))
      continue;
    const field = tokens[position + 2];
    if (!checkIsGoPunctuation(tokens[position + 1], ".") || field?.kind !== GoTokenKind.Identifier) continue;
    const writes = fieldWriteMap.get(field.text) ?? [];
    const operator = tokens[position + 3];
    const line = token.line;
    if (checkIsGoPunctuation(operator, "++") || checkIsGoPunctuation(operator, "--"))
      writes.push({ file, line, value: undefined });
    else if (checkIsGoPunctuation(operator, "=")) {
      const { end, expression } = parseGoExpression(tokens, position + 4);
      const isLiteral = tokens[end]?.kind === GoTokenKind.Newline;
      let value: GoValue | undefined;
      if (!isLiteral) value = undefined;
      else if (expression.kind === GoExpressionKind.Number)
        value = toGoNumberValue(expression.value, expression.isFloat);
      else if (expression.kind === GoExpressionKind.Identifier && expression.name.startsWith(COOLDOWN_TAG_PREFIX))
        value = expression.name;
      writes.push({ file, line, value });
    } else if (
      operator?.kind === GoTokenKind.Punctuation &&
      ARITHMETIC_OPERATORS.has(operator.text) &&
      checkIsGoPunctuation(tokens[position + 4], "=")
    )
      writes.push({ file, line, value: undefined });
    else continue;
    fieldWriteMap.set(field.text, writes);
  }
};
