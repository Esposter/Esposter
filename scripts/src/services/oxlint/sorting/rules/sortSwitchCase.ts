import type { CaseBlock } from "#src/models/oxlint/sorting/CaseBlock";
import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context, ESTree, Fixer, Rule } from "@oxlint/plugins";

import { checkIsPureExpression } from "#src/services/oxlint/sorting/checkIsPureExpression";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { getItemRange, getItemTrailer } from "#src/services/oxlint/sorting/getItemRange";
import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";
import { splitRuns } from "#src/services/oxlint/sorting/splitRuns";
import { defineRule } from "@oxlint/plugins";

// A switch's cases in three checks: the tests within each run of fallthrough cases, the default kept last in its run,
// And the case blocks (cases sharing one body) in order. A block that ends without a break or return stays last. A
// Switch with a test that runs code keeps its default and its blocks as written, since moving either moves that test,
// And so does one whose labels are not all literals, since two of them can name the same value
const sortSwitchCase: Rule = defineRule({
  create(context) {
    return {
      SwitchStatement(node) {
        if (node.cases.length < 2) return;
        if (
          checkIsConditionExpression(node.discriminant) ||
          node.cases.some((caseNode) => caseNode.test && checkIsConditionExpression(caseNode.test))
        )
          return;
        const hasUnsortedTests = reportCaseTests(context, node.cases);
        if (node.cases.some((caseNode) => caseNode.test && !checkIsPureExpression(caseNode.test))) return;
        reportDefaultPlacement(context, node.cases);
        // Two identifiers or calls can name one value, and the first matching block runs, so only literal labels reorder
        if (node.cases.every((caseNode) => !caseNode.test || caseNode.test.type === "Literal"))
          reportCaseBlocks(context, node.cases, hasUnsortedTests);
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

// Reports the tests of each run that sort out of order, and returns whether any run does
const reportCaseTests = (context: Context, cases: ESTree.SwitchCase[]): boolean => {
  let hasUnsortedTests = false;
  for (const run of splitRuns(cases, checkHasCaseBody)) {
    const items: SortingItem[] = run.flatMap((caseNode) =>
      caseNode.test ? [{ evaluated: caseNode.test, name: getCaseName(context, caseNode), node: caseNode.test }] : [],
    );
    const sortedItems = items.toSorted((left, right) => compareNames(left.name, right.name));
    hasUnsortedTests ||= sortedItems.some((item, index) => item !== items[index]);
    reportUnsorted(context, items);
  }
  return hasUnsortedTests;
};

// Reports a default that is not the last case of its run, and swaps its label with the last case's label. Only the
// Run's last case has a body, so the labels can trade places without changing which body runs
const reportDefaultPlacement = (context: Context, cases: ESTree.SwitchCase[]): void => {
  const run = splitRuns(cases, checkHasCaseBody).find((candidate) => candidate.some((caseNode) => !caseNode.test));
  const defaultCase = run?.find((caseNode) => !caseNode.test);
  const lastCase = run?.at(-1);
  if (!defaultCase || !lastCase || lastCase === defaultCase) return;
  const defaultLabelRange = getLabelRange(context, defaultCase);
  const lastLabelRange = getLabelRange(context, lastCase);
  if (!defaultLabelRange || !lastLabelRange) return;
  const { text } = context.sourceCode;
  context.report({
    fix: (fixer: Fixer) => [
      fixer.replaceTextRange(defaultLabelRange, text.slice(...lastLabelRange)),
      fixer.replaceTextRange(lastLabelRange, text.slice(...defaultLabelRange)),
    ],
    message: `Expected "${getCaseName(context, lastCase)}" to come before "default".`,
    node: defaultCase,
  });
};

// Reports each block that sorts before the block ahead of it, at the block's first case. The fix rewrites the blocks
// In order, and is left out when a run's tests are out of order, which their own report fixes first
const reportCaseBlocks = (context: Context, cases: ESTree.SwitchCase[], hasUnsortedTests: boolean): void => {
  const blocks = splitRuns(cases, checkHasBreakOrReturn).flatMap((run): CaseBlock[] => {
    const [firstCase] = run;
    return firstCase
      ? [{ cases: run, isDefaultClause: run.some((caseNode) => !caseNode.test), name: getCaseName(context, firstCase) }]
      : [];
  });
  const lastBlock = blocks.at(-1);
  const lastCase = lastBlock?.cases.at(-1);
  const lastBlockToKeepInPlace = lastBlock && lastCase && !checkHasBreakOrReturn(lastCase) ? lastBlock : undefined;
  const compareBlocks = (left: CaseBlock, right: CaseBlock): number => {
    if (left === lastBlockToKeepInPlace) return 1;
    if (right === lastBlockToKeepInPlace) return -1;
    if (left.isDefaultClause) return 1;
    if (right.isDefaultClause) return -1;
    return compareNames(left.name, right.name);
  };
  const sortedBlocks = blocks.toSorted(compareBlocks);
  const blockRanges = blocks.map((block) => getBlockRange(context, block));
  const sortedTexts = sortedBlocks.map((block) => context.sourceCode.text.slice(...getBlockRange(context, block)));
  const fix = (fixer: Fixer) =>
    hasUnsortedTests ? [] : blockRanges.map((range, index) => fixer.replaceTextRange(range, sortedTexts[index] ?? ""));
  for (const [index, block] of blocks.entries()) {
    const previousBlock = blocks[index - 1];
    const previousCase = previousBlock?.cases.at(-1);
    const [firstCase] = block.cases;
    if (!previousBlock || !previousCase || !firstCase) continue;
    if (sortedBlocks.indexOf(previousBlock) < sortedBlocks.indexOf(block)) continue;
    context.report({
      fix,
      message: `Expected "${block.name}" to come before "${getCaseName(context, previousCase)}".`,
      node: firstCase,
    });
  }
};

// A block runs from its first case's leading comments through its last case and the comment ending that line
const getBlockRange = (context: Context, block: CaseBlock): [number, number] => {
  const [firstCase] = block.cases;
  const lastCase = block.cases.at(-1);
  if (!firstCase || !lastCase) return [0, 0];
  const lastCaseEnd = getItemTrailer(context, lastCase).comment?.range[1] ?? getItemRange(context, lastCase)[1];
  return [getItemRange(context, firstCase)[0], lastCaseEnd];
};

// A case's label runs from the case keyword through the colon that ends it, found after the test, so a parenthesized
// Test is read whole
const getLabelRange = (context: Context, caseNode: ESTree.SwitchCase): [number, number] | undefined => {
  const { sourceCode } = context;
  const labelEnd = caseNode.test ?? sourceCode.getFirstToken(caseNode);
  const colon = labelEnd && sourceCode.getTokenAfter(labelEnd, (token) => token.value === ":");
  return colon ? [caseNode.range[0], colon.range[1]] : undefined;
};

// A run's case ends a body when it has statements of its own
const checkHasCaseBody = (caseNode: ESTree.SwitchCase): boolean => caseNode.consequent.length > 0;

// A case label by its literal value, `default` for the default, and by its source text otherwise
const getCaseName = (context: Context, caseNode: ESTree.SwitchCase): string => {
  if (caseNode.test?.type === "Literal") return String(caseNode.test.value);
  if (!caseNode.test) return "default";
  return context.sourceCode.getText(caseNode.test);
};

// Whether a case's body ends in a break or return, looking through one block around its statements
const checkHasBreakOrReturn = (caseNode: ESTree.SwitchCase): boolean => {
  const [firstStatement] = caseNode.consequent;
  const statements = firstStatement?.type === "BlockStatement" ? firstStatement.body : caseNode.consequent;
  return statements.some((statement) => statement.type === "BreakStatement" || statement.type === "ReturnStatement");
};

// A condition in a switch makes its cases order-free, so perfectionist leaves the whole switch alone
const checkIsConditionExpression = (node: ESTree.Expression): boolean => {
  switch (node.type) {
    case "BinaryExpression":
    case "LogicalExpression":
      return true;
    case "Literal":
      return typeof node.value === "boolean";
    case "UnaryExpression":
      return node.operator === "!";
    default:
      return false;
  }
};

export default sortSwitchCase;
