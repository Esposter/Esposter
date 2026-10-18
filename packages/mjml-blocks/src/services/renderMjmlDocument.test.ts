import type { BlockDocument } from "headless-block-editor";

import {
  TEST_BUTTON_ID,
  TEST_COLUMN_ID,
  TEST_IMAGE_ID,
  TEST_MAX_NODES,
  TEST_REGISTRY,
  TEST_SECTION_ID,
  TEST_TEXT_ID,
} from "#src/services/constants.test";
import { renderMjmlDocument } from "#src/services/renderMjmlDocument";
import { createBlockDocumentSchema } from "headless-block-editor";
import mjml2html from "mjml";
import { describe, expect, test } from "vitest";

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
    expect(renderMjmlDocument(document, TEST_REGISTRY, { isStampingIds: false })).toStrictEqual({
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
    const { html } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, { isStampingIds: false }), {
      validationLevel: "strict",
    });
    expect(html).toContain('href="https://example.com/?a=1&amp;b=&quot;2&quot;"');
    expect(html).not.toContain("&amp;amp;");
  });
  test("a valid email compiles under strict validation", async () => {
    expect.hasAssertions();

    const document = createBlockDocumentSchema(TEST_REGISTRY, TEST_MAX_NODES).parse(EMAIL_DOCUMENT);
    const { errors } = await mjml2html(renderMjmlDocument(document, TEST_REGISTRY, { isStampingIds: false }), {
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
    expect(renderMjmlDocument(document, TEST_REGISTRY, { isStampingIds: true })).toStrictEqual({
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
});
