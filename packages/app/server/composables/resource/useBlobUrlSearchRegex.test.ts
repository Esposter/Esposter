import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;
const matchOne = (content: string) => takeOne(content.match(useBlobUrlSearchRegex()) ?? []);

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

describe(useBlobUrlSearchRegex, () => {
  test("should match the whole SAS query of a canonicalized download URL", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo%20%281%29.png?rscd=attachment%3B%20filename%3D%22photo%20%281%29.png%22&sig=a%2Fb`;

    expect(matchOne(`"${url}"`)).toBe(url);
  });

  test("should stop at the closing quote of a single-quoted css url() when the URL has no SAS query", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    expect(matchOne(`background-image:url('${url}');color:red`)).toBe(url);
  });

  test("should stop at the closing paren of an unquoted css url()", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png?sig=a%2Fb`;

    expect(matchOne(`background-image:url(${url});color:red`)).toBe(url);
  });

  test("should stop at the escaped quote of a JSON-serialized html attribute", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    expect(matchOne(JSON.stringify({ html: `<img src="${url}">` }))).toBe(url);
  });

  test("should match a URL opened by no delimiter at all", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    expect(matchOne(url)).toBe(url);
  });

  test("should keep the literal parens of a legacy URL signed before urls were canonicalized", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo%20(1).png?sig=a%2Fb`;

    expect(matchOne(`<img src="${url}">`)).toBe(url);
  });

  test("should keep every literal sub-delimiter of a legacy URL in a double-quoted attribute", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo!'()*.png`;

    expect(matchOne(`<img src="${url}">`)).toBe(url);
  });

  test("should keep the literal parens of a legacy URL in a single-quoted css url()", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo(1).png?sig=a%2Fb`;

    expect(matchOne(`background-image:url('${url}');color:red`)).toBe(url);
  });

  test("should not run past the closing quote into the content that follows it", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    expect(matchOne(`<img src="${url}" alt="a">`)).toBe(url);
  });

  test("should match a URL and the longer URL it is a prefix of as separate whole URLs", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/logo.png`;
    const longerUrl = `${url}.webp`;

    expect(`<img src="${url}"><img src="${longerUrl}">`.match(useBlobUrlSearchRegex())).toStrictEqual([url, longerUrl]);
  });

  test("should not match a URL from a different container", () => {
    expect.hasAssertions();

    expect(matchOne(`"${MOCK_BLOB_BASE_URL}/${AzureContainer.ClickerAssets}/1/photo.png"`)).toBeUndefined();
  });
});
