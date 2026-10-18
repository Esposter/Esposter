import { TEST_COLUMN_ID, TEST_IMAGE_ID, TEST_REGISTRY } from "#src/services/constants.test";
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
        undefined,
      ),
    ).toStrictEqual({ attributes: { alt: "", src: "https://example.com/a.png" }, tagName: "mj-image" });
  });
  test("#179 #196 a node's id and an unset attribute are never written", () => {
    expect.hasAssertions();

    const image = getBlockTypeDefinition(TEST_REGISTRY, "mj-image");
    expect(
      image?.render(
        { props: { alt: "A cat", id: TEST_IMAGE_ID, src: "https://example.com/a.png" }, type: "mj-image" },
        {},
        undefined,
      ),
    ).toStrictEqual({ attributes: { alt: "A cat", src: "https://example.com/a.png" }, tagName: "mj-image" });

    const socialElement = getBlockTypeDefinition(TEST_REGISTRY, "mj-social-element");
    expect(
      socialElement?.render(
        { props: { content: "Share", id: TEST_IMAGE_ID }, type: "mj-social-element" },
        {},
        undefined,
      ),
    ).toStrictEqual({ attributes: {}, content: "Share", tagName: "mj-social-element" });
  });
  test("#257 a column's width is written as its own attribute, which MJML lays out", () => {
    expect.hasAssertions();

    const column = getBlockTypeDefinition(TEST_REGISTRY, "mj-column");
    expect(
      column?.render(
        { props: { children: [], id: TEST_COLUMN_ID, width: "50%" }, type: "mj-column" },
        { children: [] },
        undefined,
      ),
    ).toStrictEqual({ attributes: { width: "50%" }, children: [], tagName: "mj-column" });
  });
  test("#391 an attribute holding markup is written escaped once", () => {
    expect.hasAssertions();

    const image = getBlockTypeDefinition(TEST_REGISTRY, "mj-image");
    expect(
      image?.render({ props: { alt: "A", id: TEST_IMAGE_ID, title: '<b>&"' }, type: "mj-image" }, {}, undefined),
    ).toStrictEqual({ attributes: { alt: "A", title: "&lt;b&gt;&amp;&quot;" }, tagName: "mj-image" });
  });
});
