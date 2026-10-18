import type { MathExpressionNode } from "#src/models/shared/MathExpressionNode";

import { parseMathExpression } from "#src/services/parser/parseMathExpression";
import { describe } from "vitest";

export const parseNode = (formula: string): MathExpressionNode =>
  parseMathExpression(formula).match(
    (node) => node,
    (error) => {
      throw error;
    },
  );

describe.todo("parseNode");
