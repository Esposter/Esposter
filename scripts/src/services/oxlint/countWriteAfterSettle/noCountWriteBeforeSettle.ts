import type { SettleFrame } from "#src/models/oxlint/countWriteAfterSettle/SettleFrame";
import type { ESTree, Rule } from "@oxlint/plugins";

import { checkIsApplyOptimisticFunction } from "#src/services/oxlint/countWriteAfterSettle/checkIsApplyOptimisticFunction";
import { checkIsCountTarget } from "#src/services/oxlint/countWriteAfterSettle/checkIsCountTarget";
import { checkIsMutationCall } from "#src/services/oxlint/countWriteAfterSettle/checkIsMutationCall";
import { MESSAGE } from "#src/services/oxlint/countWriteAfterSettle/constants";
import { defineRule } from "@oxlint/plugins";

export const noCountWriteBeforeSettle: Rule = defineRule({
  create(context) {
    const frameStack: SettleFrame[] = [];
    const enterFunction = (node: ESTree.Node) => {
      frameStack.push({ awaitEnds: [], node, writes: [] });
    };
    // A count written before the await that settles the first mutation sent in its function moves before the server
    // Answers. The settling await is the first one of the function's own that ends after the mutation starts: the
    // Await around `executeMutation(...)` ends after the call it wraps, so a write inside that call's arguments is
    // Before it. A write with no await after the mutation settles nothing, so it is before the answer whatever its place
    const reportUnsettledWrites = (frame: SettleFrame) => {
      const { mutationStart } = frame;
      if (mutationStart === undefined) return;

      const settleEnd = Math.min(...frame.awaitEnds.filter((end) => end > mutationStart));
      for (const write of frame.writes) if (write.start < settleEnd) context.report({ message: MESSAGE, node: write });
    };
    const exitFunction = () => {
      const frame = frameStack.pop();
      if (frame === undefined) return;
      // A mutation's `applyOptimistic` runs when the write is sent, so its writes belong to the function that sends it
      if (checkIsApplyOptimisticFunction(frame.node)) frameStack.at(-1)?.writes.push(...frame.writes);
      else reportUnsettledWrites(frame);
    };
    return {
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      AssignmentExpression(node) {
        if (checkIsCountTarget(node.left)) frameStack.at(-1)?.writes.push(node);
      },
      AwaitExpression(node) {
        frameStack.at(-1)?.awaitEnds.push(node.end);
      },
      CallExpression(node) {
        // Every function around the call holds it, so each one's first mutation is the earliest call in its body
        if (checkIsMutationCall(node)) for (const frame of frameStack) frame.mutationStart ??= node.start;
      },
      ForOfStatement(node) {
        // Only `for await` suspends, and it does so on its iterable before the first body
        if (node.await) frameStack.at(-1)?.awaitEnds.push(node.right.end);
      },
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      UpdateExpression(node) {
        if (checkIsCountTarget(node.argument)) frameStack.at(-1)?.writes.push(node);
      },
    };
  },
  meta: { type: "problem" },
});
