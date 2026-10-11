import type { UnterminatedResult } from "#src/models/sweeps/unterminatedResults/UnterminatedResult";

import { getDescendants } from "#src/services/sweeps/getDescendants";
import ts from "typescript";

const RESULT_CALLEE_NAMES = new Set(["getResult", "getResultAsync"]);
const TERMINATOR_NAMES = new Set(["andTee", "andThen", "mapErr", "map", "match", "orElse", "orTee", "unwrapOr"]);
const AFTER_LENGTH = 34;

const checkIsResultCall = (node: ts.Node): node is ts.CallExpression =>
  ts.isCallExpression(node) && ts.isIdentifier(node.expression) && RESULT_CALLEE_NAMES.has(node.expression.text);

// Whether `node` is the subject of the link above it: a bracket, an await, a non-null assertion, or a member or
// Call written on it. An argument or a callback body is not, since the value leaves the expression there
const checkIsSubjectOfParent = (node: ts.Node): boolean => {
  const { parent } = node;
  if (ts.isPropertyAccessExpression(parent) || ts.isCallExpression(parent)) return parent.expression === node;
  return ts.isParenthesizedExpression(parent) || ts.isAwaitExpression(parent) || ts.isNonNullExpression(parent);
};

// The top of the chain the call's value sits in, and whether a terminator is called on it along the way
const getValueChain = (call: ts.CallExpression): { isTerminated: boolean; top: ts.Node } => {
  let isTerminated = false;
  let top: ts.Node = call;
  while (checkIsSubjectOfParent(top)) {
    const { parent } = top;
    if (
      ts.isPropertyAccessExpression(parent) &&
      TERMINATOR_NAMES.has(parent.name.text) &&
      ts.isCallExpression(parent.parent) &&
      parent.parent.expression === parent
    )
      isTerminated = true;
    top = parent;
  }
  return { isTerminated, top };
};

// The nearest block a node sits in, which is where a binding it declares can be read from
const getScope = (node: ts.Node): ts.Node => {
  let scope = node.parent;
  while (!ts.isBlock(scope) && !ts.isSourceFile(scope)) scope = scope.parent;
  return scope;
};

// Whether a `binding.match(…)`-style terminator is called on the binding after the call. A longer property name, or
// Another object's field spelled the same, is not the binding, so only the identifier itself is read
const checkIsBindingTerminated = (call: ts.CallExpression, bindingName: string, scope: ts.Node): boolean =>
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

// A `Result` nothing terminates fails silently. Its value is only this file's to answer when it stands as a statement,
// Or when it is bound to a name no later line terminates; anywhere else the caller owns the terminator.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const sourceFile = ts.createSourceFile("", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return getDescendants(sourceFile)
    .filter((node) => checkIsResultCall(node))
    .flatMap((call) => {
      const { isTerminated, top } = getValueChain(call);
      if (isTerminated) return [];

      const { parent } = top;
      const bindingName =
        ts.isVariableDeclaration(parent) && parent.initializer === top && ts.isIdentifier(parent.name)
          ? parent.name.text
          : undefined;
      if (bindingName === undefined && !ts.isExpressionStatement(parent)) return [];

      const scope = getScope(call);
      if (bindingName !== undefined && checkIsBindingTerminated(call, bindingName, scope)) return [];

      const scopeEnd = ts.isBlock(scope) ? scope.end - 1 : text.length;
      const after = text.slice(call.end, scopeEnd).replaceAll(/\s+/gu, " ").trim().slice(0, AFTER_LENGTH);
      const line = sourceFile.getLineAndCharacterOfPosition(call.getStart(sourceFile)).line + 1;
      return [{ after, line }];
    });
};
