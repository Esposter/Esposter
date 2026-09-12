import type { ESTree } from "@oxlint/plugins";

import { checkIsRethrowingHandler } from "#src/services/oxlint/persistThenNotify/checkIsRethrowingHandler";

// A chain ending in `.match` with an err handler that absorbs the error settles on what the handlers return and
// Never rejects, whatever it roots at: only a neverthrow chain terminates that way (error-handling/SKILL.md), so
// The terminal is proof enough on its own, and a helper handing back its ResultAsync needs no name here.
export const checkHasAbsorbingMatchTerminal = (expression: ESTree.Expression): boolean =>
  expression.type === "CallExpression" &&
  expression.callee.type === "MemberExpression" &&
  expression.callee.property.type === "Identifier" &&
  expression.callee.property.name === "match" &&
  expression.arguments.length === 2 &&
  !checkIsRethrowingHandler(expression.arguments[1]);
