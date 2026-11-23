import type { ESTree } from "@oxlint/plugins";

import { checkIsNodeInsideDeferredFunction } from "#src/services/oxlint/sorting/checkIsNodeInsideDeferredFunction";
import { describe, expect, test } from "vitest";

// A hand-built tree, each node made under its parent, so the check reads the range and parent it reads in a lint run
const createNode = (type: string, range: [number, number], parent?: ESTree.Node): ESTree.Node =>
  ({ parent, range, type }) as unknown as ESTree.Node;

describe(checkIsNodeInsideDeferredFunction, () => {
  test("a bare arrow statement, whose range is its statement's, is deferred", () => {
    expect.hasAssertions();
    // `() => { read(x) }` with no semicolon: the arrow shares its statement's exact range
    const statement = createNode("ExpressionStatement", [0, 17]);
    const arrow = createNode("ArrowFunctionExpression", [0, 17], statement);
    const block = createNode("BlockStatement", [6, 17], arrow);
    const readStatement = createNode("ExpressionStatement", [8, 15], block);
    const readCall = createNode("CallExpression", [8, 14], readStatement);
    const identifier = createNode("Identifier", [13, 14], readCall);

    expect(checkIsNodeInsideDeferredFunction(identifier, statement)).toBe(true);
  });

  test("an arrow handed to a call as an argument is not deferred", () => {
    expect.hasAssertions();
    // `run(() => { read(x) })`: the arrow is the call's argument, so it runs inside the statement
    const statement = createNode("ExpressionStatement", [0, 21]);
    const runCall = createNode("CallExpression", [0, 21], statement);
    const arrow = createNode("ArrowFunctionExpression", [4, 20], runCall);
    const block = createNode("BlockStatement", [9, 20], arrow);
    const readStatement = createNode("ExpressionStatement", [11, 18], block);
    const readCall = createNode("CallExpression", [11, 17], readStatement);
    const identifier = createNode("Identifier", [16, 17], readCall);

    expect(checkIsNodeInsideDeferredFunction(identifier, statement)).toBe(false);
  });
});
