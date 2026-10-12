import { uncapitalize } from "@esposter/shared";
import ts from "typescript";

const CREATE_PREFIX_REGEX = /^create(?=[A-Z])/u;

// The name a value a kit module makes by a call goes by: the function's, its `create` left off, none where the callee
// Has no name
export const getKitCalleeName = (call: ts.CallExpression): string | undefined => {
  const callee = ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression;
  return ts.isIdentifier(callee) ? uncapitalize(callee.text.replace(CREATE_PREFIX_REGEX, "")) : undefined;
};
