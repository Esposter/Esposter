import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";
import type { CallExpression } from "oxc-parser";

import { RESULT_CALLEE_NAMES } from "#src/services/sweeps/unterminatedResults/constants";

export const checkIsResultCall = (node: SyntaxNode): node is CallExpression =>
  node.type === "CallExpression" && node.callee.type === "Identifier" && RESULT_CALLEE_NAMES.has(node.callee.name);
