import type { TMXObjectNode } from "#src/models/tmx/node/TMXObjectNode";
import type { TMXTextNode } from "#src/models/tmx/node/TMXTextNode";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { createObjectShared } from "#src/test/createObjectShared.test";
import { createPropertiesNode } from "#src/test/createPropertiesNode.test";
import { parseObject } from "#src/util/parseObject";
import { describe, expect, test } from "vitest";

describe(parseObject, () => {
  const name = "name";
  const value = "value";
  const attribute = "attribute";
  const _ = "_";
  const baseNode = { "#name": TMXNodeType.Object, $: createObjectShared(), $$: [] };
  const properties = createPropertiesNode(name, value);

  test("parses properties", () => {
    expect.hasAssertions();

    const object = parseObject(assertNode<TMXObjectNode>({ ...baseNode, properties }));

    expect(object.properties).toStrictEqual([{ name, value }]);
  });

  test("appends a text node's attributes to the properties", () => {
    expect.hasAssertions();

    const text = [assertNode<TMXTextNode>({ $: { [attribute]: value }, $$: undefined, _ })];
    const object = parseObject(assertNode<TMXObjectNode>({ ...baseNode, properties, text }));

    expect(object.text).toBe(_);
    expect(object.properties).toStrictEqual([
      { name, value },
      { name: attribute, value },
    ]);
  });

  test("keeps the properties for an attributeless text node", () => {
    expect.hasAssertions();

    const text = [assertNode<TMXTextNode>({ $: undefined, $$: undefined, _ })];
    const object = parseObject(assertNode<TMXObjectNode>({ ...baseNode, properties, text }));

    expect(object.properties).toStrictEqual([{ name, value }]);
  });
});
