import type { TMXPropertyNode } from "#src/models/tmx/node/TMXPropertyNode";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { parseProperties } from "#src/services/parseProperties";
import { assertNode } from "#src/test/assertNode.test";
import { describe, expect, test } from "vitest";

describe(parseProperties, () => {
  const name = "name";
  const value = "value";
  const _ = "_";
  const createPropertyNode = ($: TMXPropertyNode["$"]) =>
    assertNode<TMXPropertyNode>({ "#name": TMXNodeType.Property, $, $$: undefined, _ });

  test("parses", () => {
    expect.hasAssertions();

    expect(parseProperties([])).toStrictEqual([]);
    expect(parseProperties([{ property: [createPropertyNode({ name, value })] }])).toStrictEqual([{ name, value }]);
  });

  test("falls back to the data value", () => {
    expect.hasAssertions();

    expect(parseProperties([{ property: [createPropertyNode({ name })] }])).toStrictEqual([{ name, value: _ }]);
  });

  test("parses every property of every block", () => {
    expect.hasAssertions();

    expect(
      parseProperties([
        { property: [createPropertyNode({ name, value }), createPropertyNode({ name: value, value: name })] },
        { property: [createPropertyNode({ name: _, value })] },
      ]),
    ).toStrictEqual([
      { name, value },
      { name: value, value: name },
      { name: _, value },
    ]);
  });
});
