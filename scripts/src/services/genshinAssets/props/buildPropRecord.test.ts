import type { PropKind } from "#src/models/genshinAssets/props/PropKind";

import { PropShape } from "#src/models/genshinAssets/props/PropShape";
import { buildPropRecord } from "#src/services/genshinAssets/props/buildPropRecord";
import { describe, expect, test } from "vitest";

describe(buildPropRecord, () => {
  const kind: PropKind = { mesh: "b", name: "a", shape: PropShape.Hull };

  test("a publish of a fitted prop writes numbers only", () => {
    expect.hasAssertions();

    expect(buildPropRecord(kind, { boxes: [[0, 0, 0, 1, 1, 1]], shape: PropShape.Hull }).objects).toStrictEqual({
      "props/a": { boxes: [[0, 0, 0, 1, 1, 1]], shape: PropShape.Hull },
    });
  });

  test("a record carrying the game's mesh is refused at publish", () => {
    expect.hasAssertions();

    expect(() => buildPropRecord(kind, { boxes: [[0, 0, 0, 1, 1, 1]], shape: PropShape.Hull, vertices: [[0, 0, 0]] }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "unrecognized_keys",
          "keys": [
            "vertices"
          ],
          "path": [],
          "message": "Unrecognized key: \\"vertices\\""
        }
      ]]
    `);
  });
});
