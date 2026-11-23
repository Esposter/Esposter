import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

import { checkIsSentinel } from "#src/services/oxlint/errorHandling/checkIsSentinel";
import { collectNodes } from "#src/services/oxlint/errorHandling/collectNodes";
import { UNCOMMENTED_FALLBACK_MESSAGE } from "#src/services/oxlint/errorHandling/constants";
import { defineRule } from "@oxlint/plugins";

// The sinks a failure reaches: a console call, or the alert a user is shown
const LOG_REGEX = /\bconsole\.\w+|\bcreateErrorAlert\b/u;

// A comment beside the call names why its failure is the expected answer: within the call's own lines, or on the line
// Directly above them. A comment further off, say above the function the call sits in, names the function, not the
// Failure
const checkIsCommented = (node: ESTree.Node, sourceCode: SourceCode): boolean =>
  sourceCode
    .getAllComments()
    .some(
      ({ loc }) =>
        (loc.start.line >= node.loc.start.line && loc.end.line <= node.loc.end.line) ||
        loc.end.line === node.loc.start.line - 1,
    );

// A chain that logs its failure on the way in: an `.orTee` into a sink, anywhere down the receivers it is called on
const checkIsLoggedUpstream = (node: ESTree.Node, sourceCode: SourceCode): boolean => {
  if (node.type !== "CallExpression" || node.callee.type !== "MemberExpression") return false;
  const [firstArgument] = node.arguments;
  const isTeed =
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "orTee" &&
    firstArgument !== undefined &&
    LOG_REGEX.test(sourceCode.getText(firstArgument));
  return isTeed || checkIsLoggedUpstream(node.callee.object, sourceCode);
};

// An err arm that hands back a sentinel without logging the failure it was given
const checkIsSilentArm = (arm: ESTree.Node, sourceCode: SourceCode): boolean => {
  if (arm.type !== "ArrowFunctionExpression" && arm.type !== "FunctionExpression") return false;
  const { body } = arm;
  if (!body || LOG_REGEX.test(sourceCode.getText(arm))) return false;
  // An arm that rethrows the failures it does not expect hands those on, so only the expected one is answered here
  if (collectNodes(body).some(({ type }) => type === "ThrowStatement")) return false;
  // An arm that reads the failure it is given hands it on or records it, where only one that ignores it drops it
  const [parameter] = arm.params;
  const parameterNames = parameter
    ? collectNodes(parameter).flatMap((node) => (node.type === "Identifier" ? [node.name] : []))
    : [];
  if (collectNodes(body).some((node) => node.type === "Identifier" && parameterNames.includes(node.name))) return false;
  if (body.type !== "BlockStatement") return checkIsSentinel(body);
  return body.body.some(
    (statement) => statement.type === "ReturnStatement" && (!statement.argument || checkIsSentinel(statement.argument)),
  );
};

// Reports a Result whose failure becomes nothing: `.unwrapOr(undefined)`, or a `.match` whose err arm returns a
// Sentinel Without a log. A reader cannot tell that failure from an empty answer, so a comment beside it must name why
// The failure Is expected, or the failure is logged. See the error-handling skill.
export const noUncommentedFallback: Rule = defineRule({
  create(context) {
    const { sourceCode } = context;
    return {
      CallExpression(node) {
        if (
          node.callee.type !== "MemberExpression" ||
          node.callee.computed ||
          node.callee.property.type !== "Identifier"
        )
          return;
        const { name } = node.callee.property;
        const [fallback, errorArm] = node.arguments;
        const isSilentFallback =
          (name === "unwrapOr" && fallback !== undefined && checkIsSentinel(fallback)) ||
          (name === "match" &&
            node.arguments.length === 2 &&
            errorArm !== undefined &&
            checkIsSilentArm(errorArm, sourceCode));
        if (
          isSilentFallback &&
          !checkIsLoggedUpstream(node.callee.object, sourceCode) &&
          !checkIsCommented(node, sourceCode)
        )
          context.report({ message: UNCOMMENTED_FALLBACK_MESSAGE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});
