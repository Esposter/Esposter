import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

const BinaryOperatorPrecedenceMap: Partial<Record<string, number>> = { "%": 2, "*": 2, "+": 1, "-": 1, "/": 2 };
const OPENING_BRACKETS = new Set(["(", "[", "{"]);
const CLOSING_BRACKETS = new Set([")", "]", "}"]);
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
  const isPunctuation = (text: string) => {
    const token = peek();
    return token?.kind === GoTokenKind.Punctuation && token.text === text;
  };
  const skipNewlines = () => {
    while (peek()?.kind === GoTokenKind.Newline) position++;
  };
  // Skips a bracketed run whose opening bracket is at the position, nested brackets and all
  const skipBalanced = () => {
    let depth = 0;
    do {
      const token = peek();
      if (token === undefined) return;
      if (token.kind === GoTokenKind.Punctuation && OPENING_BRACKETS.has(token.text)) depth++;
      else if (token.kind === GoTokenKind.Punctuation && CLOSING_BRACKETS.has(token.text)) depth--;
      position++;
    } while (depth > 0);
  };
  const readQualifiedName = (): string => {
    let name = peek()?.text ?? "";
    position++;
    while (isPunctuation(".") && tokens[position + 1]?.kind === GoTokenKind.Identifier) {
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
    while (peek() !== undefined && !isPunctuation("}")) {
      if (tokens[position + 1]?.kind === GoTokenKind.Punctuation && tokens[position + 1]?.text === ":") {
        position = bodyStart;
        skipBalanced();
        return UNKNOWN_EXPRESSION;
      }
      elements.push(readBinary(0));
      skipNewlines();
      if (isPunctuation(",")) position++;
      skipNewlines();
    }
    position++;
    return { elements, kind: GoExpressionKind.Composite };
  };
  const readPrimary = (): GoExpression => {
    skipNewlines();
    const token = peek();
    if (token === undefined) return UNKNOWN_EXPRESSION;
    if (token.kind === GoTokenKind.Number) {
      position++;
      return { kind: GoExpressionKind.Number, value: Number(token.text.replaceAll("_", "")) };
    } else if (token.kind === GoTokenKind.String) {
      position++;
      return { kind: GoExpressionKind.String, value: token.text.slice(1, -1) };
    } else if (token.kind === GoTokenKind.Identifier) {
      if (token.text === "func") {
        while (peek() !== undefined && !isPunctuation("{")) position++;
        skipBalanced();
        return UNKNOWN_EXPRESSION;
      }
      const name = readQualifiedName();
      if (!isPunctuation("{")) return { kind: GoExpressionKind.Identifier, name };
      // A typed composite, a struct's literal such as `info.Point{Y: 1}`, which no value read here is
      skipBalanced();
      return UNKNOWN_EXPRESSION;
    } else if (isPunctuation("(")) {
      position++;
      const expression = readBinary(0);
      skipNewlines();
      position++;
      return expression;
    } else if (isPunctuation("-") || isPunctuation("+")) {
      position++;
      return { kind: GoExpressionKind.Unary, operand: readPostfix(), operator: token.text };
    } else if (isPunctuation("[")) {
      // A slice or array type, `[]int` or `[][]float64`, then its composite literal
      while (isPunctuation("[")) skipBalanced();
      while (peek()?.kind === GoTokenKind.Identifier || isPunctuation(".") || isPunctuation("*")) position++;
      return isPunctuation("{") ? readCompositeBody() : UNKNOWN_EXPRESSION;
    } else if (isPunctuation("{")) return readCompositeBody();
    position++;
    return UNKNOWN_EXPRESSION;
  };
  const readPostfix = (): GoExpression => {
    let expression = readPrimary();
    for (;;)
      if (isPunctuation("(")) {
        position++;
        const parameters: GoExpression[] = [];
        skipNewlines();
        while (peek() !== undefined && !isPunctuation(")")) {
          parameters.push(readBinary(0));
          skipNewlines();
          if (isPunctuation(",")) position++;
          skipNewlines();
        }
        position++;
        expression =
          expression.kind === GoExpressionKind.Identifier
            ? { callee: expression.name, kind: GoExpressionKind.Call, parameters }
            : UNKNOWN_EXPRESSION;
      } else if (isPunctuation("[")) {
        const indexStart = position;
        position++;
        const index = readBinary(0);
        skipNewlines();
        if (isPunctuation("]")) {
          position++;
          expression = { index, kind: GoExpressionKind.Index, target: expression };
        } else {
          position = indexStart;
          skipBalanced();
          expression = UNKNOWN_EXPRESSION;
        }
      } else if (isPunctuation(".") && tokens[position + 1]?.kind === GoTokenKind.Identifier) {
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
