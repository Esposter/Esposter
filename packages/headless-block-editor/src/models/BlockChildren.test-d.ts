import type { BlockChildren } from "#src/models/BlockChildren";
import type { SectionNode, TestNode } from "#src/services/constants.test";

import { describe, expect, expectTypeOf, test } from "vitest";

const sectionChildren = (node: SectionNode) => ({ children: node.props.children });
const port: BlockChildren<TestNode> = (node) => (node.type === "section" ? sectionChildren(node) : {});

describe("block children type", () => {
  test("a port returning a slot's children assigns to the port of the union with no assertion", () => {
    expect.hasAssertions();

    expectTypeOf(port).toEqualTypeOf<BlockChildren<TestNode>>();
  });
});
