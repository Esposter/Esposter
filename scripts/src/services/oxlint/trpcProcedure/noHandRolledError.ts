import type { Rule } from "@oxlint/plugins";

import { checkIsBadRequestCode } from "#src/services/oxlint/trpcProcedure/checkIsBadRequestCode";
import { MISSING_MESSAGE } from "#src/services/oxlint/trpcProcedure/constants";
import { ErrorGuardMap } from "#src/services/oxlint/trpcProcedure/ErrorGuardMap";
import { getHandRolledErrorName } from "#src/services/oxlint/trpcProcedure/getHandRolledErrorName";
import { getHandRolledMessage } from "#src/services/oxlint/trpcProcedure/getHandRolledMessage";
import { getPropertyValue } from "#src/services/oxlint/trpcProcedure/getPropertyValue";
import { defineRule } from "@oxlint/plugins";

export const noHandRolledError: Rule = defineRule({
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "TRPCError") return;
        const [argument] = node.arguments;
        if (argument?.type !== "ObjectExpression") return;

        // An explicitly written message is hand-rolled wherever it sits — a spread earlier in the object cannot
        // Make `message: new NotFoundError(...).message` mean anything else
        for (const property of argument.properties) {
          const errorName = getHandRolledErrorName(property);
          const guardName = errorName === undefined ? undefined : ErrorGuardMap[errorName];
          if (errorName !== undefined && guardName !== undefined) {
            context.report({ message: getHandRolledMessage(errorName, guardName), node });
            return;
          }
        }
        // Only the properties after the last spread are decidable: a later key overrides the spread, so a
        // `message` written past it is definitely present, while one written before it may be overridden and a
        // Spread with no `message` after it may still be supplying one
        const lastSpreadIndex = argument.properties.findLastIndex((property) => property.type === "SpreadElement");
        const decidableProperties = argument.properties.slice(lastSpreadIndex + 1);
        const hasMessage = decidableProperties.some((property) => getPropertyValue(property, "message") !== undefined);
        if (hasMessage) return;
        else if (lastSpreadIndex !== -1) return;
        // A bare BAD_REQUEST is the other half of the same convention: the code without the message the skill
        // Requires beside it
        if (argument.properties.some((property) => checkIsBadRequestCode(property)))
          context.report({ message: MISSING_MESSAGE, node });
      },
    };
  },
  meta: { type: "problem" },
});
