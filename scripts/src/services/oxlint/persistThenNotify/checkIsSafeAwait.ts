import type { ESTree } from "@oxlint/plugins";

import { checkHasAbsorbingMatchTerminal } from "#src/services/oxlint/persistThenNotify/checkHasAbsorbingMatchTerminal";
import { checkHasRethrowingTerminal } from "#src/services/oxlint/persistThenNotify/checkHasRethrowingTerminal";
import { AllowedRoots, LiteralNodeTypes, PromiseCombinators } from "#src/services/oxlint/persistThenNotify/constants";
import { getBlockEffects } from "#src/services/oxlint/persistThenNotify/getBlockEffects";
import { getRootCalleeName } from "#src/services/oxlint/persistThenNotify/getRootCalleeName";

// Never rejects: an absorbing `.match` terminal, an allowed wrapper whose terminal absorbs the error,
// `Promise.allSettled` over anything, or a rejecting Promise combinator over a fan-out (array literal or `.map`
// Callback) of such calls — e.g. `Promise.all(users.map((u) => createSystemRoomMessage(u).match(noop, console.error)))`.
// Unrecognised syntax falls through to `false`, which reports rather than exempts, so the shapes deliberately left
// Out (a ternary or `&&` chain in the await position, a `function` expression as the `.map` callback) cost a false
// Positive and never a miss — and none of them appear anywhere in `apps/web/server`, the only tree this rule
// Runs over. A false positive here is loud and immediate: it fails the lint on the line that wrote it. Widen this
// When one of those shapes actually lands, not before — every branch added is one the fixture suite has to pin.
export const checkIsSafeAwait = (argument: ESTree.Expression): boolean => {
  if (checkHasAbsorbingMatchTerminal(argument)) return true;
  const rootName = getRootCalleeName(argument);
  if (rootName !== undefined && AllowedRoots.has(rootName)) return !checkHasRethrowingTerminal(argument);
  if (
    argument.type === "CallExpression" &&
    argument.callee.type === "MemberExpression" &&
    argument.callee.object.type === "Identifier" &&
    argument.callee.object.name === "Promise" &&
    argument.callee.property.type === "Identifier"
  ) {
    // `Promise.allSettled` resolves an array of outcomes and never rejects regardless of its elements
    if (argument.callee.property.name === "allSettled") return true;
    // `Promise.resolve` adopts what it is handed, so it rejects whenever that value is a rejecting promise. Only a
    // Literal is safe on sight: an identifier or member expression is the ordinary way to hold an already-started
    // Promise (`const deletion = client.deleteBlob(name); … await Promise.resolve(deletion)`), so blessing those
    // Would hand the rule's own defect a syntax that walks straight past it
    if (argument.callee.property.name === "resolve") {
      const [value] = argument.arguments;
      return value === undefined || LiteralNodeTypes.has(value.type);
    }
    if (!PromiseCombinators.has(argument.callee.property.name)) return false;
    const [collection] = argument.arguments;
    if (collection?.type === "ArrayExpression")
      return collection.elements.every(
        (element) => element !== null && element.type !== "SpreadElement" && checkIsSafeAwait(element),
      );
    if (
      collection?.type === "CallExpression" &&
      collection.callee.type === "MemberExpression" &&
      collection.callee.property.type === "Identifier" &&
      collection.callee.property.name === "map"
    ) {
      const [callback] = collection.arguments;
      if (callback?.type === "ArrowFunctionExpression")
        return callback.body.type === "BlockStatement"
          ? getBlockEffects(callback.body).every((effect) => checkIsSafeAwait(effect))
          : checkIsSafeAwait(callback.body);
    }
  }
  return false;
};
