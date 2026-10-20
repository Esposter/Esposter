import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { mjmlNavbarType } from "#src/services/components/mjNavbar";
import { TEST_COLUMN_ID, TEST_IMAGE_ID, TEST_REGISTRY } from "#src/services/constants.test";
import { getBlockTypeDefinition } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe("renderMjmlNode", () => {
  test("a decorative image renders an empty alternative text", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.Image);
    const image: MjmlImageNode = {
      props: { decorative: true, id: TEST_IMAGE_ID, src: "https://example.com/a.png" },
      type: MjmlNodeType.Image,
    };
    expect(definition?.render(image, {}, undefined)).toStrictEqual({
      attributes: { alt: "", src: "https://example.com/a.png" },
      tagName: "mj-image",
    });
  });

  test("#179 #196 a node's id and an unset attribute are never written", () => {
    expect.hasAssertions();

    const imageDefinition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.Image);
    const image: MjmlImageNode = {
      props: { alt: "A cat", id: TEST_IMAGE_ID, src: "https://example.com/a.png" },
      type: MjmlNodeType.Image,
    };
    expect(imageDefinition?.render(image, {}, undefined)).toStrictEqual({
      attributes: { alt: "A cat", src: "https://example.com/a.png" },
      tagName: "mj-image",
    });

    const socialElementDefinition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.SocialElement);
    const socialElement: MjmlSocialElementNode = {
      props: { content: "Share", id: TEST_IMAGE_ID },
      type: MjmlNodeType.SocialElement,
    };
    expect(socialElementDefinition?.render(socialElement, {}, undefined)).toStrictEqual({
      attributes: {},
      content: "Share",
      tagName: "mj-social-element",
    });
  });

  test("#257 a column's width is written as its own attribute, which MJML lays out", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.Column);
    const column: MjmlColumnNode = {
      props: { children: [], id: TEST_COLUMN_ID, width: "50%" },
      type: MjmlNodeType.Column,
    };
    expect(definition?.render(column, { children: [] }, undefined)).toStrictEqual({
      attributes: { width: "50%" },
      children: [],
      tagName: "mj-column",
    });
  });

  test("#391 an attribute holding markup is written escaped once", () => {
    expect.hasAssertions();

    const definition = getBlockTypeDefinition(TEST_REGISTRY, MjmlNodeType.Image);
    const image: MjmlImageNode = { props: { alt: "A", id: TEST_IMAGE_ID, title: '<b>&"' }, type: MjmlNodeType.Image };
    expect(definition?.render(image, {}, undefined)).toStrictEqual({
      attributes: { alt: "A", title: "&lt;b&gt;&amp;&quot;" },
      tagName: "mj-image",
    });
  });

  test.each([
    ["ico-close", "⊗"],
    ["ico-open", "☰"],
  ])("a navbar's default %s renders as its icon, not as the entity's text", (name, icon) => {
    expect.hasAssertions();

    const navbar: MjmlNavbarNode = {
      props: { children: [], id: crypto.randomUUID(), [name]: mjmlNavbarType.defaultAttributes[name] },
      type: MjmlNodeType.Navbar,
    };
    expect(mjmlNavbarType.render(navbar, {}, undefined)).toStrictEqual({
      attributes: { [name]: icon },
      children: [],
      tagName: "mj-navbar",
    });
  });
});
