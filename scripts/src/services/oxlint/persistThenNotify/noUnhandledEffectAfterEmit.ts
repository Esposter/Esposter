import type { FunctionBinding } from "#src/models/oxlint/persistThenNotify/FunctionBinding";
import type { FunctionFrame } from "#src/models/oxlint/persistThenNotify/FunctionFrame";
import type { Context, ESTree, Rule } from "@oxlint/plugins";

import { checkIsCertainPromiseExpression } from "#src/services/oxlint/persistThenNotify/checkIsCertainPromiseExpression";
import { checkIsEmitCall } from "#src/services/oxlint/persistThenNotify/checkIsEmitCall";
import { checkIsSafeAwait } from "#src/services/oxlint/persistThenNotify/checkIsSafeAwait";
import { MESSAGE } from "#src/services/oxlint/persistThenNotify/constants";
import { getBoundFunctionName } from "#src/services/oxlint/persistThenNotify/getBoundFunctionName";
import { defineRule } from "@oxlint/plugins";

export const noUnhandledEffectAfterEmit: Rule = defineRule({
  create(context: Context) {
    const functionStack: FunctionFrame[] = [];
    // A name on its own is not a function: a sibling function's own `notify`, or one shadowing an outer
    // Notifying `notify`, is a different binding, and arming its caller reports every await that follows it — a
    // False error whose only cure is making a fatal write best-effort, the inversion this rule exists to prevent.
    const functionBindings: FunctionBinding[] = [];
    const enterFunction = (node: ESTree.Node) => {
      const boundFunctionName = getBoundFunctionName(node);
      if (boundFunctionName !== undefined)
        functionBindings.push({
          isNotifying: false,
          name: boundFunctionName,
          node,
          scopeNode: functionStack.at(-1)?.node,
        });
      functionStack.push({ node });
    };
    const exitFunction = () => {
      functionStack.pop();
    };
    // The binding a name resolves to here: the innermost one whose scope is still open, exactly as the reader of
    // The call site resolves it. A scope not on the stack is closed — that binding is not this name.
    const getVisibleBinding = (name: string) => {
      let visibleBinding: FunctionBinding | undefined = undefined;
      let visibleDepth = -1;
      for (const binding of functionBindings) {
        if (binding.name !== name) continue;
        // Module scope (no enclosing function) is depth 0 and always visible; a frame's depth is its stack position
        const depth =
          binding.scopeNode === undefined
            ? 0
            : functionStack.findIndex((frame) => frame.node === binding.scopeNode) + 1;
        if (depth === 0 && binding.scopeNode !== undefined) continue;
        else if (depth >= visibleDepth) {
          visibleBinding = binding;
          visibleDepth = depth;
        }
      }
      return visibleBinding;
    };
    const checkIsNotifyClosureCall = (callee: ESTree.Expression): boolean =>
      callee.type === "Identifier" && (getVisibleBinding(callee.name)?.isNotifying ?? false);
    // An emit inside a nested callback still notifies every function that RUNS that callback, so it arms the whole
    // Enclosing chain — otherwise wrapping the write+emit in `getResultAsync(async () => …)` hides the notify from
    // Every await that follows it. Each outer frame is armed at the position of the construct that runs the callback,
    // Never at the emit's own: the emit sits lexically before everything after that construct, so comparing raw
    // Positions would report a fatal await that runs BEFORE the notify — a false error whose only cure is wrapping a
    // Fatal write in a best-effort handler, the opposite of this standard. That position is the enclosing call when
    // The callback is passed straight to one, and otherwise the later call to the name it was bound to, which is why
    // The walk records the name and hands the rest to the CallExpression visitor rather than stopping outright.
    // Emits propagate outward only: a frame opened after the emit is a separate deferred body and stays unarmed
    const armFramesFrom = (start: number) => {
      let armStart = start;
      for (const frame of functionStack.toReversed()) {
        frame.emitStart ??= armStart;
        const { parent } = frame.node;
        if (parent?.type === "CallExpression" && parent.arguments.some((argument) => argument === frame.node)) {
          armStart = parent.start;
          continue;
        }
        // Marked on the binding itself, by identity — the name is only how a later call finds its way back here
        const notifyingBinding = functionBindings.find(({ node }) => node === frame.node);
        if (notifyingBinding) notifyingBinding.isNotifying = true;
        break;
      }
    };
    // Every effect the enclosing function can still reject on once it has notified: an `await`, the iterable of a
    // `for await`, and a returned promise, which rejects the awaiting caller exactly as an `await` would.
    const reportUnhandledEffect = (node: ESTree.Node, effect: ESTree.Expression) => {
      const frame = functionStack.at(-1);
      if (frame?.emitStart === undefined) return;
      // Before the notify — a fatal guard, not a tail effect
      else if (node.start < frame.emitStart) return;
      // Never rejects
      else if (checkIsSafeAwait(effect)) return;
      context.report({ message: MESSAGE, node });
    };
    return {
      ArrowFunctionExpression: enterFunction,
      "ArrowFunctionExpression:exit": exitFunction,
      AwaitExpression(node) {
        reportUnhandledEffect(node, node.argument);
      },
      CallExpression(node) {
        // An emit arms the function holding it, and a call to a closure that holds one arms the function making
        // That call — the two entry points are the same walk from a different starting position
        if (checkIsEmitCall(node) || checkIsNotifyClosureCall(node.callee)) armFramesFrom(node.start);
      },
      ForOfStatement(node) {
        // Only `for await`: a plain for-of settles on nothing
        if (node.await) reportUnhandledEffect(node, node.right);
      },
      FunctionDeclaration: enterFunction,
      "FunctionDeclaration:exit": exitFunction,
      FunctionExpression: enterFunction,
      "FunctionExpression:exit": exitFunction,
      ReturnStatement(node) {
        if (node.argument && checkIsCertainPromiseExpression(node.argument)) reportUnhandledEffect(node, node.argument);
      },
    };
  },
  meta: { type: "problem" },
});
