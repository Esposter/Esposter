import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import {
  TEST_CONTEXT,
  TEST_ID,
  TEST_LABEL,
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
              tag: "section",
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
      opening: '<!doctype html><html lang="en">',
    });
  });
});
