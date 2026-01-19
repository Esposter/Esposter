import type { TMXPropertyNode } from "@/models/tmx/node/TMXPropertyNode";

import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import { parseProperties } from "@/util/parseProperties";
import { assertNode } from "@/util/test/assertNode";
import { describe, expect, test } from "vitest";

describe(parseProperties, () => {
  const name = "name";
  const value = "value";
  const _ = "_";

  test("parses", () => {
    expect.hasAssertions();

    expect(parseProperties([])).toStrictEqual([]);
    expect(
      parseProperties([
        {
          property: [
            assertNode<TMXPropertyNode>({
              "#name": TMXNodeType.Data,
              $: { name, value },
              $$: undefined,
              _,
            }),
          ],
        },
      ]),
    ).toStrictEqual([{ name, value }]);
    expect(
      parseProperties([
        {
          property: [
            assertNode<TMXPropertyNode>({
              "#name": TMXNodeType.Data,
              $: { name },
              $$: undefined,
              _,
            }),
          ],
        },
      ]),
    ).toStrictEqual([{ name, value: _ }]);
  });
});
