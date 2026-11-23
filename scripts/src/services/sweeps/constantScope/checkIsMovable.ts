import type { Node } from "oxc-parser";

import { HOISTED_CALLEE } from "#src/services/sweeps/constantScope/constants";

// A function holds no state of its own, and a `vi.hoisted` block must stay at module scope, so neither is a constant to
// Move
export const checkIsMovable = (initializer: Node | undefined, text: string): boolean =>
  initializer === undefined ||
  (initializer.type !== "ArrowFunctionExpression" &&
    initializer.type !== "FunctionExpression" &&
    !text.slice(initializer.start, initializer.end).includes(HOISTED_CALLEE));
