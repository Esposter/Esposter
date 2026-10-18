import type { BlockDocument, BlockNode } from "headless-block-editor";

import {
  TEST_DOCUMENT,
  TEST_MAX_NODES,
  TEST_REGISTRY,
  TEST_RENDER_OPTIONS,
  TEST_RICH_TEXT,
} from "#src/services/constants.test";
import { parseMjmlDocument } from "#src/services/parseMjmlDocument";
import { renderMjmlDocument } from "#src/services/renderMjmlDocument";
import { serializeMjml } from "#src/services/serializeMjml";
import { createBlockDocumentSchema } from "headless-block-editor";
import { describe, expect, test } from "vitest";

const createNode = (type: string, props: Record<string, unknown> = {}): BlockNode => ({
  props: { id: crypto.randomUUID(), ...props },
  type,
});

// Every built-in block type, each with an attribute set, every content kind and a decorative image, with the head's every prop
const EVERY_TYPE_CONTENT: BlockDocument = {
  content: [
    createNode("mj-raw", { content: "<p>kept</p>", position: "file-start" }),
    createNode("mj-hero", {
      "background-color": "#ffffff",
      children: [createNode("mj-text", { color: "#000000", content: "Hero" })],
    }),
    createNode("mj-wrapper", {
      "background-url": "https://example.com/bg.png",
      children: [
        createNode("mj-section", {
          "background-color": "#ffffff",
          children: [
            createNode("mj-column", {
              "background-color": "#ffffff",
              children: [
                createNode("mj-text", {
                  align: "left",
                  content: 'Hi <a href="https://example.com" style="color:red">link</a>',
                }),
                createNode("mj-button", { content: "Go & stop", href: 'https://example.com/?a="1"&b=2' }),
                createNode("mj-image", { alt: "A cat", src: "https://example.com/a.png", width: "300px" }),
                createNode("mj-image", { decorative: true, src: "https://example.com/b.png" }),
                createNode("mj-divider", { align: "center" }),
                createNode("mj-spacer", { height: "10px" }),
                createNode("mj-table", { content: "Cell", width: "100%" }),
                createNode("mj-raw", { content: "<p>kept</p>" }),
                createNode("mj-social", {
                  children: [createNode("mj-social-element", { content: "Share", name: "facebook" })],
                  "icon-size": "20px",
                  mode: "horizontal",
                }),
                createNode("mj-navbar", {
                  children: [createNode("mj-navbar-link", { content: "Home", href: "https://example.com" })],
                }),
                createNode("mj-carousel", {
                  children: [createNode("mj-carousel-image", { alt: "One", src: "https://example.com/c.png" })],
                }),
                createNode("mj-accordion", {
                  children: [
                    createNode("mj-accordion-element", {
                      children: [
                        createNode("mj-accordion-title", { content: "Title" }),
                        createNode("mj-accordion-text", { content: "<p>Text</p>" }),
                      ],
                    }),
                  ],
                }),
              ],
              "inner-background-color": "#eeeeee",
              padding: "5px 10px",
              "vertical-align": "middle",
            }),
          ],
        }),
        createNode("mj-section", {
          children: [
            createNode("mj-group", {
              children: [createNode("mj-column", { children: [createNode("mj-text", { content: "Grouped" })] })],
              direction: "ltr",
            }),
          ],
          "full-width": "full-width",
        }),
      ],
      "full-width": "full-width",
    }),
  ],
  root: {
    props: {
      attributes: { all: { "font-family": "Arial" }, "mj-text": { color: "#000000" } },
      body: { "background-color": "#ffffff", width: "600px" },
      breakpoint: { width: "480px" },
      dir: "ltr",
      fonts: [{ href: "https://fonts.example.com/a.css", name: "Test" }],
      lang: "en",
      preview: "Preview",
      styles: [
        { css: ".a{color:red}", inline: false },
        { css: "p{margin:0}", inline: true },
      ],
      title: "Hi & bye",
    },
  },
};
const EVERY_TYPE_DOCUMENT = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse(EVERY_TYPE_CONTENT);

describe(parseMjmlDocument, () => {
  test("rendering a parsed email returns its source", () => {
    expect.hasAssertions();

    const json = renderMjmlDocument(EVERY_TYPE_DOCUMENT, TEST_REGISTRY, TEST_RENDER_OPTIONS);
    const result = parseMjmlDocument(serializeMjml(json), TEST_REGISTRY, TEST_RICH_TEXT, TEST_MAX_NODES);
    expect(result.error?.issues.map((issue) => issue.message) ?? []).toStrictEqual([]);
    expect(renderMjmlDocument(result.data ?? TEST_DOCUMENT, TEST_REGISTRY, TEST_RENDER_OPTIONS)).toStrictEqual(json);
  });
  test("an import holding a tag the package leaves out is refused", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      '<mjml><mj-head><mj-include path="./header.mjml"></mj-include></mj-head><mj-body></mj-body></mjml>',
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "mj-include"']);
  });
  test("raw html is cleaned before it is stored", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      "<mjml><mj-body><mj-raw><script>alert(1)</script><p>kept</p></mj-raw></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(result.error?.issues.map((issue) => issue.message) ?? []).toStrictEqual([]);
    expect(result.data?.content.map((node) => node.props.content)).toStrictEqual(["<p>kept</p>"]);
  });
  test("a label holding an element is refused at its content", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      "<mjml><mj-body><mj-section><mj-column><mj-button><b>Go</b></mj-button></mj-column></mj-section></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(result.error?.issues.map((issue) => issue.path)).toStrictEqual([
      ["content", 0, "props", "children", 0, "props", "children", 0, "props", "content"],
    ]);
  });
  test("#41 #149 a self-closing image beside a text reads back as two nodes", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      '<mjml><mj-body><mj-section><mj-column><mj-image src="https://example.com/a.png" alt="A" /><mj-text>After</mj-text></mj-column></mj-section></mj-body></mjml>',
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(result.data).toStrictEqual({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    { props: { alt: "A", id: expect.any(String), src: "https://example.com/a.png" }, type: "mj-image" },
                    { props: { content: "After", id: expect.any(String) }, type: "mj-text" },
                  ],
                  id: expect.any(String),
                },
                type: "mj-column",
              },
            ],
            id: expect.any(String),
          },
          type: "mj-section",
        },
      ],
      root: { props: { body: {} } },
    });
  });
  test("stray text is refused by name, not dropped", () => {
    expect.hasAssertions();

    const inContainer = parseMjmlDocument(
      "<mjml><mj-body><mj-section>Hi</mj-section></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(inContainer.error?.issues.map((issue) => issue.message)).toStrictEqual(['"#text" is not in the registry']);

    const inHead = parseMjmlDocument(
      "<mjml><mj-head>Hi</mj-head><mj-body></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(inHead.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "#text"']);
  });
  test("a second document or text outside the mjml is refused, not dropped", () => {
    expect.hasAssertions();

    const secondDocument = parseMjmlDocument(
      "<mjml><mj-body></mj-body></mjml><mjml><mj-body></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(secondDocument.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "#document"']);

    const outsideText = parseMjmlDocument(
      "<mjml><mj-body></mj-body></mjml>a",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(outsideText.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "#text"']);
  });

  test("a second body is refused by name, not merged", () => {
    expect.hasAssertions();

    const body = parseMjmlDocument(
      '<mjml><mj-body></mj-body><mj-body width="600px"></mj-body></mjml>',
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(body.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "mj-body"']);

    const head = parseMjmlDocument(
      "<mjml><mj-head></mj-head><mj-head></mj-head><mj-body></mj-body></mjml>",
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );
    expect(head.error?.issues.map((issue) => issue.message)).toStrictEqual(['Unrecognized key: "mj-head"']);
  });
  test("#179 an id attribute is refused at its node, not taken as the node's id", () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      '<mjml><mj-body><mj-section id="hero"></mj-section></mj-body></mjml>',
      TEST_REGISTRY,
      TEST_RICH_TEXT,
      TEST_MAX_NODES,
    );

    expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
      { message: 'Unrecognized key: "#id"', path: ["content", 0, "props"] },
    ]);
  });
});
