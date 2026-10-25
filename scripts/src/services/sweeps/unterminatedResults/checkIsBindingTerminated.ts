import { getDescendants } from "#src/services/sweeps/getDescendants";
import { TERMINATOR_NAMES } from "#src/services/sweeps/unterminatedResults/constants";
import ts from "typescript";

// Whether a `binding.match(…)`-style terminator is called on the binding after the call. A longer property name, or
// Another object's field spelled the same, is not the binding, so only the identifier itself is read
export const checkIsBindingTerminated = (call: ts.CallExpression, bindingName: string, scope: ts.Node): boolean =>
  getDescendants(scope).some(
    (node) =>
      ts.isPropertyAccessExpression(node) &&
      node.pos >= call.end &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === bindingName &&
      TERMINATOR_NAMES.has(node.name.text) &&
      ts.isCallExpression(node.parent) &&
      node.parent.expression === node,
  );
