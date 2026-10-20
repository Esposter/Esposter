import { TEST_CHILDREN, TEST_LIST_ID, TEST_NODE_SCHEMA } from "#src/services/constants.test";
import { createBlockNodesSchema } from "#src/services/createBlockNodesSchema";
import { describe, expect, test } from "vitest";

describe(createBlockNodesSchema, () => {
  test("a refusal names the accepted types sorted and each once", () => {
    expect.hasAssertions();

    const image = { props: { id: TEST_LIST_ID }, type: "image" };
    const { error, success } = createBlockNodesSchema(TEST_NODE_SCHEMA, TEST_CHILDREN, [
      "list",
      "heading",
      "list",
    ]).safeParse([image]);

    expect(success).toBe(false);
    expect(error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: "type must be one of heading, list", path: [0, "type"] },
    ]);
  });
});
