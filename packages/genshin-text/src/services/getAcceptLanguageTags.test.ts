import { getAcceptLanguageTags } from "#src/services/getAcceptLanguageTags";
import { describe, expect, test } from "vitest";

describe(getAcceptLanguageTags, () => {
  test.each([
    ["", []],
    ["ja", ["ja"]],
    ["ja-JP,ja;q=0.9,en;q=0.8", ["ja-JP", "ja", "en"]],
    ["en;q=0.5, fr", ["fr", "en"]],
    ["en, fr", ["en", "fr"]],
    ["en;q=0, fr;q=x, de", ["de"]],
  ])("%j reads %j", (header, expected) => {
    expect.hasAssertions();

    expect(getAcceptLanguageTags(header)).toStrictEqual(expected);
  });
});
