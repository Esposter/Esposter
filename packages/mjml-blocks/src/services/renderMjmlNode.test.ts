import { TEST_IMAGE_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { getBlockTypeDefinition } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe("renderMjmlNode", () => {
  test("a decorative image renders an empty alternative text", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, "mj-image");
    expect(
      definition?.render(
        { props: { decorative: true, id: TEST_IMAGE_ID, src: "https://example.com/a.png" }, type: "mj-image" },
        {},
      ),
    ).toStrictEqual({ attributes: { alt: "", src: "https://example.com/a.png" }, tagName: "mj-image" });
  });
});
