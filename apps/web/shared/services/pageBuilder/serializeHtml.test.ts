import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { describe, expect, test } from "vitest";

describe(serializeHtml, () => {
  test("a text child is escaped and a raw node is written as given", () => {
    expect.hasAssertions();

    expect(serializeHtml(["<a>", { html: "<b>x</b>" }])).toStrictEqual("&lt;a&gt;<b>x</b>");
  });

  test("a void element is written without a closing tag and with its attribute escaped", () => {
    expect.hasAssertions();

    expect(serializeHtml([{ attributes: { alt: "", src: 'a"b' }, children: [], tag: "img" }])).toStrictEqual(
      '<img alt="" src="a&quot;b">',
    );
  });
});
