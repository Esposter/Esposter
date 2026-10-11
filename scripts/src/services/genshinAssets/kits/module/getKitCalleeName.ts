import { KIT_CREATE_PREFIX_REGEX } from "#src/services/genshinAssets/kits/constants";
import { uncapitalize } from "@esposter/shared";
import ts from "typescript";

// The name a value a kit module makes by a call goes by: the function's, its `create` left off, none where the callee
// Has no name
export const getKitCalleeName = (call: ts.CallExpression): string | undefined => {
  const callee = ts.isPropertyAccessExpression(call.expression) ? call.expression.name : call.expression;
  return ts.isIdentifier(callee) ? uncapitalize(callee.text.replace(KIT_CREATE_PREFIX_REGEX, "")) : undefined;
};
