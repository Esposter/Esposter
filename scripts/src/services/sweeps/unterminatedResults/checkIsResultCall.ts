import { RESULT_CALLEE_NAMES } from "#src/services/sweeps/unterminatedResults/constants";
import ts from "typescript";

export const checkIsResultCall = (node: ts.Node): node is ts.CallExpression =>
  ts.isCallExpression(node) && ts.isIdentifier(node.expression) && RESULT_CALLEE_NAMES.has(node.expression.text);
