import type { ESTree } from "@oxlint/plugins";

import { COUNT_FIELDS } from "#src/services/oxlint/countWriteAfterSettle/constants";
import { SERVER_COUNT_ROLE_FIELD, SERVER_COUNT_ROLE_LIST } from "@esposter/configuration/eslint/serverCountFields.js";

// A write target that is a server-derived count: a flat count field, or a role's count one level down the role list
export const checkIsCountTarget = (target: ESTree.Node): boolean => {
  if (target.type !== "MemberExpression" || target.property.type !== "Identifier") return false;
  else if (COUNT_FIELDS.has(target.property.name)) return true;
  else
    return (
      target.property.name === SERVER_COUNT_ROLE_FIELD &&
      target.object.type === "MemberExpression" &&
      target.object.object.type === "MemberExpression" &&
      target.object.object.property.type === "Identifier" &&
      target.object.object.property.name === SERVER_COUNT_ROLE_LIST
    );
};
