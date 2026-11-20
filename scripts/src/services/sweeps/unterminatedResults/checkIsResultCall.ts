import type { CallExpression, Node } from "oxc-parser";

import { RESULT_CALLEE_NAMES } from "#src/services/sweeps/unterminatedResults/constants";

export const checkIsResultCall = (node: Node): node is CallExpression =>
  node.type === "CallExpression" && node.callee.type === "Identifier" && RESULT_CALLEE_NAMES.has(node.callee.name);
