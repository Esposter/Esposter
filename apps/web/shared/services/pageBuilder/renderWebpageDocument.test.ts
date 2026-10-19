import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { buttonNodeType } from "#shared/services/pageBuilder/buttonNodeType";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
  TEST_LANG,
  TEST_OTHER_ID,
  TEST_ROOT,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
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
});
