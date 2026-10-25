import ts from "typescript";

// The nearest block a node sits in, which is where a binding it declares can be read from
export const getScope = (node: ts.Node): ts.Node => {
  let scope = node.parent;
  while (!ts.isBlock(scope) && !ts.isSourceFile(scope)) scope = scope.parent;
  return scope;
};
