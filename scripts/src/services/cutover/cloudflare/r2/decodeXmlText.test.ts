import { decodeXmlText } from "#src/services/cutover/cloudflare/r2/decodeXmlText";
import { describe, expect, test } from "vitest";

describe(decodeXmlText, () => {
  test("decodes the predefined entities and numeric references", () => {
    expect.hasAssertions();

    expect(decodeXmlText("&quot;a&amp;b&lt;c&gt;&apos;&#65;&#x42;")).toStrictEqual(`"a&b<c>'AB`);
  });

  test("reads an escaped ampersand once", () => {
    expect.hasAssertions();

    expect(decodeXmlText("&amp;lt;")).toStrictEqual("&lt;");
  });

  test("leaves an entity it does not know as written", () => {
    expect.hasAssertions();

    expect(decodeXmlText("&nbsp;")).toStrictEqual("&nbsp;");
  });
});
