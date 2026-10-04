import type { ESTree, Rule } from "@oxlint/plugins";

import { defineRule } from "@oxlint/plugins";

const MESSAGE =
  "A suite answering tRPC through setupMswTrpc names the timers it fakes, and never `setTimeout`: the batch link arms its dispatch on one, and armed under a frozen clock it never fires for any call left in the file";
const MSW_TRPC_MODULE_SUFFIX = "/services/trpc/mswTrpc.test";
const FAKED_TIMER = "setTimeout";

const checkIsFakingBatchTimer = (options: ESTree.Expression | ESTree.SpreadElement | undefined) => {
  if (options?.type !== "ObjectExpression") return true;
  const toFake = options.properties.find(
    (property): property is ESTree.ObjectProperty =>
      property.type === "Property" && property.key.type === "Identifier" && property.key.name === "toFake",
  );
  if (toFake?.value.type === "ArrayExpression")
    return toFake.value.elements.some((element) => element?.type === "Literal" && element.value === FAKED_TIMER);
  else return true;
};

export const noFakedBatchTimer: Rule = defineRule({
  create(context) {
    let isAnsweringTRPC = false;
    return {
      CallExpression(node) {
        const { callee } = node;
        if (
          isAnsweringTRPC &&
          callee.type === "MemberExpression" &&
          callee.object.type === "Identifier" &&
          callee.object.name === "vi" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "useFakeTimers" &&
          checkIsFakingBatchTimer(node.arguments[0])
        )
          context.report({ message: MESSAGE, node });
      },
      ImportDeclaration(node) {
        if (node.source.value.endsWith(MSW_TRPC_MODULE_SUFFIX)) isAnsweringTRPC = true;
      },
    };
  },
  meta: { type: "problem" },
});
