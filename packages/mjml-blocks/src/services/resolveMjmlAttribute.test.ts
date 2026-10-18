import { TEST_REGISTRY, TEST_TEXT_ID } from "#src/services/constants.test";
import { resolveMjmlAttribute } from "#src/services/resolveMjmlAttribute";
import { getBlockTypeDefinition } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(resolveMjmlAttribute, () => {
  test("an unset attribute resolves through the cascade", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, "mj-text");
    const text = { props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" };
    expect(
      definition &&
        resolveMjmlAttribute(
          definition,
          { attributes: { "mj-all": { "font-family": "Georgia" } } },
          text,
          "font-family",
        ),
    ).toBe("Georgia");
  });
  test("a set attribute wins over the cascade", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, "mj-text");
    const text = { props: { content: "Hi", "font-size": "15px", id: TEST_TEXT_ID }, type: "mj-text" };
    expect(
      definition &&
        resolveMjmlAttribute(definition, { attributes: { "mj-text": { "font-size": "20px" } } }, text, "font-size"),
    ).toBe("15px");
  });
});
