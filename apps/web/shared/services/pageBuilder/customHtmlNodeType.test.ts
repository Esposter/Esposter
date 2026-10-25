import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { customHtmlNodeType } from "#shared/services/pageBuilder/customHtmlNodeType";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { describe, expect, test } from "vitest";

// Renders a custom HTML node holding the given markup, then writes the render out as the page would
const renderCustomHtml = (html: string) =>
  serializeHtml([customHtmlNodeType.render({ props: { html, id: TEST_ID }, type: WebpageNodeType.CustomHtml })]);

describe("customHtmlNodeType", () => {
  test("custom html is cleaned before it is published", () => {
    expect.hasAssertions();

    expect(renderCustomHtml('<p onclick="alert(1)">Hi <b>there</b></p>')).toBe(
      '<div class="custom-html"><p>Hi <b>there</b></p></div>',
    );
  });

  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    // Text that is not markup is written as escaped text, and an empty block publishes as an empty block
    expect([renderCustomHtml(""), renderCustomHtml(`${TEST_LABEL} & <b>x</b>`)]).toStrictEqual([
      '<div class="custom-html"></div>',
      '<div class="custom-html">Go &amp; <b>x</b></div>',
    ]);
  });

  test("A hostile markup vector in custom HTML is removed", () => {
    expect.hasAssertions();

    // Each vector is a script or frame with an error handler, a script URL behind a leading space or in mixed case, a srcdoc, and an SVG link
    const vectors = [
      '<img src="x" onerror="alert(1)"><script>alert(1)</script><iframe src="https://example.com"></iframe>',
      '<a href=" javascript:alert(1)">x</a><a href="JaVaScRiPt:alert(1)">y</a>',
      '<div srcdoc="<b>x</b>">y</div>',
      '<svg><a xlink:href="javascript:alert(1)">x</a></svg>',
    ];

    expect(vectors.map((vector) => renderCustomHtml(vector))).toStrictEqual([
      '<div class="custom-html"></div>',
      '<div class="custom-html"><a rel="noopener noreferrer nofollow" target="_blank">x</a><a rel="noopener noreferrer nofollow" target="_blank">y</a></div>',
      '<div class="custom-html"><div>y</div></div>',
      '<div class="custom-html">x</div>',
    ]);
  });
});
