import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { parseWithSchema } from "#src/services/exec/util/parseWithSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(parseWithSchema, () => {
  const pathSchema = z.object({ relativePath: z.string() });

  test("returns the value the schema accepts", () => {
    expect.hasAssertions();

    expect(parseWithSchema({ relativePath: TEST_FILENAME }, pathSchema, parseWithSchema.name)).toStrictEqual({
      relativePath: TEST_FILENAME,
    });
  });

  test("throws an error named for the calling parser when the shape is wrong", () => {
    expect.hasAssertions();

    expect(() => parseWithSchema({ relativePath: 0 }, pathSchema, parseWithSchema.name))
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseWithSchema, ✖ Invalid input: expected string, received number
        → at relativePath]
    `);
  });
});
