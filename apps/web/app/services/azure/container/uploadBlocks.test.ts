import { MimeType } from "#shared/models/file/MimeType";
import { MEGABYTE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { takeOne } from "@esposter/shared";
import { getMockSasUrl } from "azure-mock";
import { afterEach, describe, expect, test, vi } from "vitest";

const stubFetch = () => {
  const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>(() =>
    Promise.resolve(new Response()),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};
// The commit is the last request the upload makes, after one PUT per block
const getCommitCall = (fetchMock: ReturnType<typeof stubFetch>) => takeOne(fetchMock.mock.calls.slice(-1));

describe(uploadBlocks, () => {
  const sasUrl = getMockSasUrl("", "w", "b");

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Put Block List is the only request in the upload that sets the blob's own headers, so sending its XML
  // Body's type as the blob's would store every upload as XML whatever was in it
  test("stores the blob under the file's own content type", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    const contentType = MimeType.PlainText;
    await uploadBlocks(new Blob([" "], { type: contentType }), sasUrl);
    const [commitUrl, commitInit] = getCommitCall(fetchMock);

    expect(commitUrl).toBe(`${sasUrl}&comp=blocklist`);
    expect(commitInit.headers).toStrictEqual({ "Content-Type": MimeType.Xml, "x-ms-blob-content-type": contentType });
  });

  // A file the browser could not type at all — no blob header beats one that is certainly wrong
  test("sends no blob content type for a file that has none", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    await uploadBlocks(new Blob([" "]), sasUrl);
    const [, commitInit] = getCommitCall(fetchMock);

    expect(commitInit.headers).toStrictEqual({ "Content-Type": MimeType.Xml });
  });

  // Azure refuses a block list whose decoded ids differ in length, which an eleventh block's index did unpadded —
  // Base64 hides it, rounding both lengths up to the same encoded width
  test("names every block of a blob with ids of one length", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    await uploadBlocks(new Blob([new Uint8Array(40 * MEGABYTE + 1)]), sasUrl);
    const blockIdLengths = new Set(
      fetchMock.mock.calls
        .slice(0, -1)
        .map(([url]) => atob(new URLSearchParams(url.slice(url.indexOf("?"))).get("blockid") ?? "").length),
    );

    expect(fetchMock).toHaveBeenCalledTimes(12);
    expect(blockIdLengths.size).toBe(1);
  });
});
