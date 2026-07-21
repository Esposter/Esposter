import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

describe(useBlobUrlSearchRegex, () => {
  test("should match the whole SAS query of a canonicalized download URL", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo%20%281%29.png?rscd=attachment%3B%20filename%3D%22photo%20%281%29.png%22&sig=a%2Fb`;

    expect(takeOne(`"${url}"`.match(useBlobUrlSearchRegex()))).toBe(url);
  });

  test("should stop at the closing quote of a single-quoted css url() when the URL has no SAS query", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    expect(takeOne(`background-image:url('${url}');color:red`.match(useBlobUrlSearchRegex()))).toBe(url);
  });

  test("should stop at the closing paren of an unquoted css url()", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png?sig=a%2Fb`;

    expect(takeOne(`background-image:url(${url});color:red`.match(useBlobUrlSearchRegex()))).toBe(url);
  });

  test("should match only the URL it is given when one is passed", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;
    const otherUrl = `${containerUrl}/2/photo.png`;

    expect(takeOne(`"${otherUrl}""${url}"`.match(useBlobUrlSearchRegex(url)))).toBe(url);
  });
});
