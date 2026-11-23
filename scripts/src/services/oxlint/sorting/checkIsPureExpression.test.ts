import type { ESTree } from "@oxlint/plugins";

import { checkIsPureExpression } from "#src/services/oxlint/sorting/checkIsPureExpression";
import { parseSync } from "oxc-parser";
import { describe, expect, test } from "vitest";

// The expression a source reads as, taken from the initialiser of a declaration so an object or a class parses as one
const parseExpression = (source: string): ESTree.Node => {
  const { program } = parseSync("expression.ts", `const expression = ${source};`);
  const [statement] = program.body;
  if (statement?.type !== "VariableDeclaration") throw new Error(`"${source}" is not an expression`);
  const [declarator] = statement.declarations;
  if (!declarator?.init) throw new Error(`"${source}" has no initialiser`);
  return declarator.init as unknown as ESTree.Node;
};

describe(checkIsPureExpression, () => {
  test.each([
    ["value.name", true],
    ["`total ${count}`", true],
    ["{ a: 1, b: value }", true],
    ["value as number", true],
    ["() => run()", true],
    ["class { field = run() }", true],
    ["run()", false],
    ["new Thing()", false],
    ["counter++", false],
    ["delete item.key", false],
    ["values[key]", false],
    ["{ [run()]: 1 }", false],
    ["class { static field = run() }", false],
    ["`total ${run()}`", false],
  ])("%s is pure: %s", (source, expected) => {
    expect.hasAssertions();

    expect(checkIsPureExpression(parseExpression(source))).toBe(expected);
  });
});
