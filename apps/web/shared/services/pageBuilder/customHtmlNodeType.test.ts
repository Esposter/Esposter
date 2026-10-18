import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { customHtmlNodeType } from "#shared/services/pageBuilder/customHtmlNodeType";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { describe, expect, test } from "vitest";

// Renders a custom HTML node holding the given markup, then writes the render out as the page would
const renderCustomHtml = (html: string) =>
  serializeHtml([customHtmlNodeType.render({ props: { html, id: TEST_ID }, type: WebpageNodeType.CustomHtml })]);

describe("customHtmlNodeType", () => {
  test("custom html is cleaned before it is published", () => {
    expect.hasAssertions();

    expect(renderCustomHtml('<p onclick="alert(1)">Hi <b>there</b></p>')).toStrictEqual(
      '<div class="custom-html"><p>Hi <b>there</b></p></div>',
    );
  });

  test("a javascript url behind a leading space or in mixed case is removed", () => {
    expect.hasAssertions();

    expect(renderCustomHtml('<a href=" javascript:alert(1)">x</a><a href="JaVaScRiPt:alert(1)">y</a>')).toStrictEqual(
      '<div class="custom-html"><a rel="noopener noreferrer nofollow" target="_blank">x</a><a rel="noopener noreferrer nofollow" target="_blank">y</a></div>',
    );
  });

  test("a srcdoc attribute is removed", () => {
    expect.hasAssertions();

    expect(renderCustomHtml('<div srcdoc="<b>x</b>">y</div>')).toStrictEqual(
      '<div class="custom-html"><div>y</div></div>',
    );
  });

  test("an svg xlink href is removed", () => {
    expect.hasAssertions();

    expect(renderCustomHtml('<svg><a xlink:href="javascript:alert(1)">x</a></svg>')).toStrictEqual(
      '<div class="custom-html">x</div>',
    );
  });
});
