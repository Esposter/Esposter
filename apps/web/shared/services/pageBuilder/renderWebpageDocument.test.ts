import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import { MAX_WEBPAGE_NODES } from "#shared/services/pageBuilder/constants";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_LANG,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { createTestTextDocument } from "#shared/services/pageBuilder/createTestTextDocument.test";
import { renderWebpageDocument } from "#shared/services/pageBuilder/renderWebpageDocument";
import { describe, expect, test } from "vitest";

describe(renderWebpageDocument, () => {
  test("a webpage document renders as one html document", () => {
    expect.hasAssertions();

    const html = renderWebpageDocument(
      {
        content: [
          {
            props: {
              children: [
                { props: { href: TEST_URL, id: TEST_OTHER_ID, label: TEST_LABEL }, type: WebpageNodeType.Button },
              ],
              id: TEST_ID,
              tag: HtmlTag.Section,
            },
            type: WebpageNodeType.Section,
          },
        ],
        root: TEST_ROOT,
      },
      TEST_CONTEXT,
    );

    expect({
      body: html.slice(html.indexOf("<body>")),
      documents: html.match(/<html/gu)?.length,
      opening: html.slice(0, html.indexOf("<head>")),
    }).toStrictEqual({
      body: `<body><section class="section"><a class="button" href="${TEST_URL}">${TEST_LABEL}</a></section></body></html>`,
      documents: 1,
      opening: `<!doctype html><html lang="${TEST_LANG}">`,
    });
  });

  test("a styled node carries its class and its rules after the structural css", () => {
    expect.hasAssertions();

    const html = renderWebpageDocument(
      {
        content: [
          {
            props: {
              href: TEST_URL,
              id: TEST_ID,
              label: TEST_LABEL,
              style: { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red" } } },
            },
            type: WebpageNodeType.Button,
          },
        ],
        root: TEST_ROOT,
      },
      TEST_CONTEXT,
    );

    expect(html).toBe(
      `<!doctype html><html lang="${TEST_LANG}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${buttonNodeType.css}
.pb-${TEST_ID} {
  color: red;
}</style></head><body><a class="button pb-${TEST_ID}" href="${TEST_URL}">${TEST_LABEL}</a></body></html>`,
    );
  });

  test("a button whose address runs a script is refused rather than written into the link", () => {
    expect.hasAssertions();

    expect(() =>
      renderWebpageDocument(
        {
          content: [
            {
              // oxlint-disable-next-line no-script-url -- the render is shown refusing this URL
              props: { href: "javascript:alert(1)", id: TEST_ID, label: TEST_LABEL },
              type: WebpageNodeType.Button,
            },
          ],
          root: TEST_ROOT,
        },
        TEST_CONTEXT,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "path": [
            "content",
            0,
            "props",
            "href"
          ],
          "message": "uses a scheme that is not allowed"
        }
      ]]
    `);
  });

  test("a style value that closes the stylesheet is refused rather than written into it", () => {
    expect.hasAssertions();

    expect(() =>
      renderWebpageDocument(
        {
          content: [
            {
              props: {
                href: TEST_URL,
                id: TEST_ID,
                label: TEST_LABEL,
                style: { [StyleBreakpoint.Base]: { [StyleState.Default]: { color: "red}</style><script>alert(1)" } } },
              },
              type: WebpageNodeType.Button,
            },
          ],
          root: TEST_ROOT,
        },
        TEST_CONTEXT,
      ),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "path": [
            "content",
            0,
            "props",
            "style",
            "Base",
            "Default",
            "color"
          ],
          "message": "Invalid input"
        }
      ]]
    `);
  });

  test("a language tag that closes its attribute is written escaped rather than as markup", () => {
    expect.hasAssertions();

    // A quote ends the attribute and the tag after it opens a script, which escapeAttribute keeps out of the page
    const html = renderWebpageDocument(
      { content: [], root: { props: { lang: `${TEST_LANG}"><script>alert(1)</script>`, tokens: {} } } },
      TEST_CONTEXT,
    );

    expect(html.slice(0, html.indexOf("<head>"))).toBe(
      '<!doctype html><html lang="en&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;">',
    );
  });

  test("every node of a 2,000-node document renders, in document order", () => {
    expect.hasAssertions();

    const html = renderWebpageDocument(createTestTextDocument(MAX_WEBPAGE_NODES), TEST_CONTEXT);

    const positions = Array.from({ length: MAX_WEBPAGE_NODES }, (_value, index) => html.indexOf(`node ${index}<`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toStrictEqual(
      positions.toSorted((earlierPosition, laterPosition) => earlierPosition - laterPosition),
    );
  });
});
