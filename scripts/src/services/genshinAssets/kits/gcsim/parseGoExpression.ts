import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsGoFloatLiteral } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloatLiteral";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { readGoNumberToken } from "#src/services/genshinAssets/kits/gcsim/readGoNumberToken";
import { skipGoBrackets } from "#src/services/genshinAssets/kits/gcsim/skipGoBrackets";

const BinaryOperatorPrecedenceMap: Partial<Record<string, number>> = { "%": 2, "*": 2, "+": 1, "-": 1, "/": 2 };
const UNKNOWN_EXPRESSION: GoExpression = Object.freeze({ kind: GoExpressionKind.Unknown });

// One Go expression read from its first token: the literals, integer sums, calls, indexes and composite literals
// Gcsim's action files write, each operator binding as Go binds it. A form past those, a function literal or a keyed
// Struct, is read as unknown and skipped to its end. Returns the expression and the position after it, where a line end
// At the top of the expression ends it
export const parseGoExpression = (
  tokens: readonly GoToken[],
  start: number,
): { end: number; expression: GoExpression } => {
  let position = start;
  const peek = () => tokens[position];
  const checkIsPunctuation = (text: string) => checkIsGoPunctuation(peek(), text);
  const skipNewlines = () => {
    while (peek()?.kind === GoTokenKind.Newline) position++;
  };
  const readQualifiedName = (): string => {
    let name = peek()?.text ?? "";
    position++;
    while (checkIsPunctuation(".") && tokens[position + 1]?.kind === GoTokenKind.Identifier) {
      name += `.${tokens[position + 1]?.text ?? ""}`;
      position += 2;
    }
    return name;
  };
  // A composite literal's elements from its opening brace, or unknown when any is keyed, as a struct's are
  const readCompositeBody = (): GoExpression => {
    const bodyStart = position;
    position++;
    const elements: GoExpression[] = [];
    skipNewlines();
    while (peek() !== undefined && !checkIsPunctuation("}")) {
      if (checkIsGoPunctuation(tokens[position + 1], ":")) {
        position = skipGoBrackets(tokens, bodyStart);
        return UNKNOWN_EXPRESSION;
      }
      elements.push(readBinary(0));
      skipNewlines();
      if (checkIsPunctuation(",")) position++;
      skipNewlines();
    }
    position++;
    return { elements, kind: GoExpressionKind.Composite };
  };
  const readPrimary = (): GoExpression => {
    skipNewlines();
    const token = peek();
    if (token === undefined) return UNKNOWN_EXPRESSION;
    else if (token.kind === GoTokenKind.Number) {
      position++;
      return {
        isFloat: checkIsGoFloatLiteral(token.text),
        kind: GoExpressionKind.Number,
        value: readGoNumberToken(token),
      };
    } else if (token.kind === GoTokenKind.String) {
      position++;
      return { kind: GoExpressionKind.String, value: token.text.slice(1, -1) };
    } else if (token.kind === GoTokenKind.Identifier) {
      if (token.text === "func") {
        while (peek() !== undefined && !checkIsPunctuation("{")) position++;
        position = skipGoBrackets(tokens, position);
        return UNKNOWN_EXPRESSION;
      }
      const name = readQualifiedName();
      if (!checkIsPunctuation("{")) return { kind: GoExpressionKind.Identifier, name };
      // A typed composite, a struct's literal such as `info.Point{Y: 1}`, which no value read here is
      position = skipGoBrackets(tokens, position);
      return UNKNOWN_EXPRESSION;
    } else if (checkIsPunctuation("(")) {
      position++;
      const expression = readBinary(0);
      skipNewlines();
      position++;
      return expression;
    } else if (checkIsPunctuation("-") || checkIsPunctuation("+")) {
      position++;
      return { kind: GoExpressionKind.Unary, operand: readPostfix(), operator: token.text };
    } else if (checkIsPunctuation("[")) {
      // A slice or array type, `[]int` or `[][]float64`, then its composite literal
      while (checkIsPunctuation("[")) position = skipGoBrackets(tokens, position);
      while (peek()?.kind === GoTokenKind.Identifier || checkIsPunctuation(".") || checkIsPunctuation("*")) position++;
      return checkIsPunctuation("{") ? readCompositeBody() : UNKNOWN_EXPRESSION;
    } else if (checkIsPunctuation("{")) return readCompositeBody();
    else {
      position++;
      return UNKNOWN_EXPRESSION;
    }
  };
  const readPostfix = (): GoExpression => {
    let expression = readPrimary();
    for (;;)
      if (checkIsPunctuation("(")) {
        position++;
        const parameterStarts: number[] = [];
        const parameters: GoExpression[] = [];
        skipNewlines();
        while (peek() !== undefined && !checkIsPunctuation(")")) {
          parameterStarts.push(position);
          parameters.push(readBinary(0));
          skipNewlines();
          if (checkIsPunctuation(",")) position++;
          skipNewlines();
        }
        position++;
        expression =
          expression.kind === GoExpressionKind.Identifier
            ? { callee: expression.name, kind: GoExpressionKind.Call, parameterStarts, parameters }
            : UNKNOWN_EXPRESSION;
      } else if (checkIsPunctuation("[")) {
        const indexStart = position;
        position++;
        const index = readBinary(0);
        skipNewlines();
        if (checkIsPunctuation("]")) {
          position++;
          expression = { index, kind: GoExpressionKind.Index, target: expression };
        } else {
          position = skipGoBrackets(tokens, indexStart);
          expression = UNKNOWN_EXPRESSION;
        }
      } else if (checkIsPunctuation(".") && tokens[position + 1]?.kind === GoTokenKind.Identifier) {
        position += 2;
        expression = UNKNOWN_EXPRESSION;
      } else return expression;
  };
  const readBinary = (minimumPrecedence: number): GoExpression => {
    let left = readPostfix();
    for (;;) {
      const token = peek();
      const precedence = token?.kind === GoTokenKind.Punctuation ? BinaryOperatorPrecedenceMap[token.text] : undefined;
      if (token === undefined || precedence === undefined || precedence <= minimumPrecedence) return left;
      position++;
      left = { kind: GoExpressionKind.Binary, left, operator: token.text, right: readBinary(precedence) };
    }
  };
  const expression = readBinary(0);
  return { end: position, expression };
};
