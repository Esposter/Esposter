import { checkIsSubjectOfParent } from "#src/services/sweeps/unterminatedResults/checkIsSubjectOfParent";
import { TERMINATOR_NAMES } from "#src/services/sweeps/unterminatedResults/constants";
import ts from "typescript";

// The top of the chain the call's value sits in, and whether a terminator is called on it along the way
export const getValueChain = (call: ts.CallExpression): { isTerminated: boolean; top: ts.Node } => {
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
