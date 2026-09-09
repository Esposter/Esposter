import type { TMXPropertyNode } from "#src/models/tmx/node/TMXPropertyNode";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { describe } from "vitest";

export const createPropertiesNode = (name: string, value: string): { property: TMXPropertyNode[] }[] => [
  {
    property: [
      assertNode<TMXPropertyNode>({ "#name": TMXNodeType.Property, $: { name, value }, $$: undefined, _: "" }),
    ],
  },
];

describe.todo(createPropertiesNode);
