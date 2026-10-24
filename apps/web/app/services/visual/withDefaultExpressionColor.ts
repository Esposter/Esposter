import type { Expression } from "@/models/desmos/Expression";

import { Colors } from "@/models/desmos/Colors";

// A copy with its colour, so the expression sets the drawings are built from stay as they were authored
export const withDefaultExpressionColor = (expression: Expression): Expression => ({
  ...expression,
  color: expression.color ?? Colors.Black,
});
