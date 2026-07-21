import { useUpdateBlobUrls } from "@@/server/composables/resource/useUpdateBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { BlobSASPermissions } from "@azure/storage-blob";
import { encodeBlobUrl } from "@esposter/db";
import { getMockSasUrl, MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;
// Every url handed out is canonicalized, so the expected value is the signed url put through the same encoder
const getReadSasUrl = (blobName: string) =>
  encodeBlobUrl(getMockSasUrl(`${containerUrl}/${blobName}`, BlobSASPermissions.from({ read: true }), "b"));

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));
vi.mock(
  import("@@/server/composables/azure/container/useContainerClient"),
  () => import("@@/server/composables/azure/container/useContainerClient.test"),
);

describe(useUpdateBlobUrls, () => {
  test("should return the content untouched when it holds no blob urls", async () => {
    expect.hasAssertions();

    await expect(useUpdateBlobUrls("")).resolves.toBe("");
  });

  test("should re-sign a download url without leaving a fragment of the old SAS query behind", async () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo%20%281%29.png`;
    const query = "?rscd=attachment%3B%20filename%3D%22photo%20%281%29.png%22&sig=a%2Fb";

    await expect(useUpdateBlobUrls(`<img src="${url}${query}">`)).resolves.toBe(
      `<img src="${getReadSasUrl("1/photo (1).png")}">`,
    );
  });

  test("should re-sign a url in a single-quoted css url() without consuming the declarations that follow", async () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;

    await expect(useUpdateBlobUrls(`background-image:url('${url}');color:red`)).resolves.toBe(
      `background-image:url('${getReadSasUrl("1/photo.png")}');color:red`,
    );
  });

  test("should re-sign the valid urls when another url has an invalid percent escape", async () => {
    expect.hasAssertions();

    const malformedUrl = `${containerUrl}/1/100%off.png`;
    const url = `${containerUrl}/1/photo.png`;

    await expect(useUpdateBlobUrls(`<img src="${malformedUrl}"><img src="${url}">`)).resolves.toBe(
      `<img src="${malformedUrl}"><img src="${getReadSasUrl("1/photo.png")}">`,
    );
  });
});
