import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { BlockDocument } from "headless-block-editor";

import {
  TEST_BUTTON_ID,
  TEST_COLUMN_ID,
  TEST_IMAGE_ID,
  TEST_MAX_NODES,
  TEST_REGISTRY,
  TEST_RENDER_OPTIONS,
  TEST_RICH_TEXT,
  TEST_SECTION_ID,
  TEST_TEXT_ID,
  TEST_WRAPPER_ID,
} from "#src/services/constants.test";
import { createMjmlRegistry } from "#src/services/createMjmlRegistry";
import { renderMjmlDocument } from "#src/services/renderMjmlDocument";
import { createBlockDocumentSchema } from "headless-block-editor";
import mjml2html from "mjml";
import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";
import { z } from "zod";

const MJML_PACKAGE = createRequire(import.meta.url)("mjml/package.json");

const EMAIL_DOCUMENT: BlockDocument = {
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [
                { props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" },
                {
                  props: { content: "Go", href: 'https://example.com/?a=1&b="2"', id: TEST_BUTTON_ID },
                  type: "mj-button",
                },
                { props: { alt: "A cat", id: TEST_IMAGE_ID, src: "https://example.com/a.png" }, type: "mj-image" },
              ],
              id: TEST_COLUMN_ID,
            },
            type: "mj-column",
          },
        ],
        id: TEST_SECTION_ID,
      },
      type: "mj-section",
    },
  ],
  root: { props: {} },
};

describe(renderMjmlDocument, () => {
  test("rendering where there is no document object model", () => {
    expect.hasAssertions();

    expect(Reflect.has(globalThis, "document")).toBe(false);

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
                  id: TEST_COLUMN_ID,
                },
                type: "mj-column",
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: "mj-section",
        },
      ],
      root: { props: {} },
    });
    expect(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS)).toStrictEqual({
      attributes: {},
      children: [
        {
          attributes: {},
          children: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [{ attributes: {}, content: "Hi", tagName: "mj-text" }],
                  tagName: "mj-column",
                },
              ],
              tagName: "mj-section",
            },
          ],
          tagName: "mj-body",
        },
      ],
      tagName: "mjml",
    });
  });
  test("an attribute holding a quote is escaped once", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse(EMAIL_DOCUMENT);
    const { html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(html).toContain('href="https://example.com/?a=1&amp;b=&quot;2&quot;"');
    expect(html).not.toContain("&amp;amp;");
  });
  test("a valid email compiles under strict validation", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse(EMAIL_DOCUMENT);
    const { errors } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(errors).toStrictEqual([]);
  });
  test("stamping writes an id that holds a quote as an escaped css class", () => {
    expect.hasAssertions();

    const id = 'id"1';
    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [{ props: { children: [], id }, type: "mj-section" }],
      root: { props: {} },
    });
    expect(renderMjmlDocument(document, TEST_REGISTRY, { context: undefined, isStampingIds: true })).toStrictEqual({
      attributes: {},
      children: [
        {
          attributes: {},
          children: [{ attributes: { "css-class": "id&quot;1" }, children: [], tagName: "mj-section" }],
          tagName: "mj-body",
        },
      ],
      tagName: "mjml",
    });
  });
  test("#56 #268 #304 #307 a section and a wrapper take full-width and compile", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
                        id: TEST_COLUMN_ID,
                      },
                      type: "mj-column",
                    },
                  ],
                  "full-width": "full-width",
                  id: TEST_SECTION_ID,
                },
                type: "mj-section",
              },
            ],
            "full-width": "full-width",
            id: TEST_WRAPPER_ID,
          },
          type: "mj-wrapper",
        },
      ],
      root: { props: {} },
    });
    const json = renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS);
    expect(json).toStrictEqual({
      attributes: {},
      children: [
        {
          attributes: {},
          children: [
            {
              attributes: { "full-width": "full-width" },
              children: [
                {
                  attributes: { "full-width": "full-width" },
                  children: [
                    {
                      attributes: {},
                      children: [{ attributes: {}, content: "Hi", tagName: "mj-text" }],
                      tagName: "mj-column",
                    },
                  ],
                  tagName: "mj-section",
                },
              ],
              tagName: "mj-wrapper",
            },
          ],
          tagName: "mj-body",
        },
      ],
      tagName: "mjml",
    });
    const { errors } = await mjml2html(json, { validationLevel: "strict" });
    expect(errors).toStrictEqual([]);
  });
  test("#184 #150 #185 a section in a wrapper compiles with no body of its own", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        children: [
                          {
                            props: {
                              children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
                              id: TEST_COLUMN_ID,
                            },
                            type: "mj-column",
                          },
                        ],
                        id: crypto.randomUUID(),
                      },
                      type: "mj-group",
                    },
                  ],
                  id: TEST_SECTION_ID,
                },
                type: "mj-section",
              },
            ],
            id: TEST_WRAPPER_ID,
          },
          type: "mj-wrapper",
        },
      ],
      root: { props: {} },
    });
    const { errors, html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(errors).toStrictEqual([]);
    expect(html.match(/<body/gu)).toHaveLength(1);
  });
  test("#35 #4 #118 #124 #207 #208 #248 #249 #284 #351 #370 #371 a head's font, preview and style reach the compiled email", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        children: [
                          { props: { content: "Hi", "font-family": "Test", id: TEST_TEXT_ID }, type: "mj-text" },
                        ],
                        id: TEST_COLUMN_ID,
                      },
                      type: "mj-column",
                    },
                  ],
                  id: TEST_SECTION_ID,
                },
                type: "mj-section",
              },
            ],
            id: TEST_WRAPPER_ID,
          },
          type: "mj-wrapper",
        },
      ],
      root: {
        props: {
          fonts: [{ href: "https://fonts.example.com/a.css", name: "Test" }],
          preview: "Preview",
          styles: [{ css: ".a{color:red}", inline: false }],
        },
      },
    });
    const { html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(html).toContain("https://fonts.example.com/a.css");
    expect(html).toContain(".a{color:red}");
    expect(html).toContain("Preview");
  });
  test("#388 #269 #358 #367 #368 mj-attributes applies, and MJML's defaults fill what a node sets none", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [
                    {
                      props: {
                        children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
                        id: TEST_COLUMN_ID,
                      },
                      type: "mj-column",
                    },
                  ],
                  id: TEST_SECTION_ID,
                },
                type: "mj-section",
              },
            ],
            id: TEST_WRAPPER_ID,
          },
          type: "mj-wrapper",
        },
      ],
      root: { props: { attributes: { all: { "font-family": "Arial" } } } },
    });
    const { html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(html).toContain("font-family:Arial");
    expect(html).toContain("line-height:1;");
  });
  test("#202 a body width caps the email at the width it sets", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse({
      content: [
        {
          props: {
            children: [
              {
                props: {
                  children: [{ props: { content: "Hi", id: TEST_TEXT_ID }, type: "mj-text" }],
                  id: TEST_COLUMN_ID,
                },
                type: "mj-column",
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: "mj-section",
        },
      ],
      root: { props: { body: { width: "800px" } } },
    });
    const { html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, TEST_RENDER_OPTIONS), {
      validationLevel: "strict",
    });
    expect(html).toContain("max-width:800px");
  });
  test("#406 the email compiles on the MJML 5 the package pins", () => {
    expect.hasAssertions();

    expect(MJML_PACKAGE.version).toMatch(/^5\./u);
  });
  test("a consumer's leaf type renders with the context the render is given", () => {
    expect.hasAssertions();

    const origin = "https://example.com";
    const inviteType: MjmlBlockTypeDefinition<string> = {
      allowedAttributes: {},
      defaultAttributes: {},
      propsSchema: z.strictObject({ id: z.string() }),
      render: (_node, _slots, context) => ({ attributes: { href: context }, content: "", tagName: "mj-button" }),
      slots: {},
      type: "survey-invite",
    };
    const registry = createMjmlRegistry({ leafTypes: [inviteType], richText: TEST_RICH_TEXT });
    const document: MjmlDocument = {
      content: [
        {
          props: {
            children: [
              {
                props: { children: [{ props: { id: TEST_TEXT_ID }, type: inviteType.type }], id: TEST_COLUMN_ID },
                type: "mj-column",
              },
            ],
            id: TEST_SECTION_ID,
          },
          type: "mj-section",
        },
      ],
      root: { props: {} },
    };

    expect(renderMjmlDocument(document, registry, { context: origin, isStampingIds: false })).toStrictEqual({
      attributes: {},
      children: [
        {
          attributes: {},
          children: [
            {
              attributes: {},
              children: [
                {
                  attributes: {},
                  children: [{ attributes: { href: origin }, content: "", tagName: "mj-button" }],
                  tagName: "mj-column",
                },
              ],
              tagName: "mj-section",
            },
          ],
          tagName: "mj-body",
        },
      ],
      tagName: "mjml",
    });
  });
});
