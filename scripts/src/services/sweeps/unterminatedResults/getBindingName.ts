import type { Node } from "oxc-parser";

import { parents } from "#src/services/shared/parents";

// The name a value is bound to when it leaves the statement into a declaration or an assignment to a plain identifier
export const getBindingName = (top: Node): string | undefined => {
  const parent = parents.get(top);
  if (parent?.type === "VariableDeclarator" && parent.init === top && parent.id.type === "Identifier")
    return parent.id.name;
  else if (parent?.type === "AssignmentExpression" && parent.right === top && parent.left.type === "Identifier")
    return parent.left.name;
  else return undefined;
};
