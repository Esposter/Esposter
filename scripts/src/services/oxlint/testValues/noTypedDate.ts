import type { ESTree, Rule } from "@oxlint/plugins";

import { checkIsTypedCalendarDate } from "#src/services/oxlint/testValues/checkIsTypedCalendarDate";
import { EPOCH_YEAR, MESSAGE, TEMPORAL_DATE_TYPES } from "#src/services/oxlint/testValues/constants";
import { getStringText } from "#src/services/oxlint/testValues/getStringText";
import { defineRule } from "@oxlint/plugins";

export const noTypedDate: Rule = defineRule({
  create(context) {
    // A string handed to a date constructor is typed whatever year it carries, but one the string visitor already
    // Reports for its year is not reported a second time here
    const reportConstructedString = (
      argument: ESTree.Expression | ESTree.SpreadElement | undefined,
      node: ESTree.Node,
    ) => {
      const text = getStringText(argument);
      if (text !== undefined && !checkIsTypedCalendarDate(text)) context.report({ message: MESSAGE, node });
    };
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "from" &&
          callee.object.type === "MemberExpression" &&
          callee.object.object.type === "Identifier" &&
          callee.object.object.name === "Temporal" &&
          callee.object.property.type === "Identifier" &&
          TEMPORAL_DATE_TYPES.has(callee.object.property.name)
        )
          reportConstructedString(node.arguments[0], node);
      },
      Literal(node) {
        if (typeof node.value === "string" && checkIsTypedCalendarDate(node.value))
          context.report({ message: MESSAGE, node });
      },
      NewExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "Date") return;

        const [first] = node.arguments;
        // Local date parts spell the epoch's own days, and `new Date(1970, 0, 2, 13)` is the skill's own example
        if (node.arguments.length > 1 && first?.type === "Literal" && String(first.value) !== EPOCH_YEAR)
          context.report({ message: MESSAGE, node });
        else reportConstructedString(first, node);
      },
      TemplateLiteral(node) {
        if (checkIsTypedCalendarDate(node.quasis.map((quasi) => quasi.value.raw).join("")))
          context.report({ message: MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
