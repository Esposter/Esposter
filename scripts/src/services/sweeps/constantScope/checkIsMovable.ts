import { HOISTED_CALLEE } from "#src/services/sweeps/constantScope/constants";
import ts from "typescript";

// A function holds no state of its own, and a `vi.hoisted` block must stay at module scope, so neither is a constant to move
export const checkIsMovable = (initializer: ts.Expression | undefined): boolean =>
  initializer === undefined ||
  (!ts.isArrowFunction(initializer) &&
    !ts.isFunctionExpression(initializer) &&
    !initializer.getText().includes(HOISTED_CALLEE));
