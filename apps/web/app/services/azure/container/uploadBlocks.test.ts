import { MimeType } from "#shared/models/file/MimeType";
import { MEGABYTE } from "#shared/services/app/constants";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
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
  const blobUrl = "https://storage.test/container/blob";
  const sasUrl = getMockSasUrl("", "w", "b");

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
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

  // Each block reports as it lands, and the last one lands at completion, so the progress ends at one
  test("reports each landed block's share of the blob up to completion", async () => {
    expect.hasAssertions();

    stubFetch();
    const progressNotifier = vi.fn<(progress: number) => void>();
    await uploadBlocks(new Blob([new Uint8Array(8 * MEGABYTE + 1)]), sasUrl, progressNotifier);

    expect(progressNotifier.mock.calls).toStrictEqual([[1 / 3], [2 / 3], [1]]);
  });

  // A refused block is never counted, while the blocks that land around it still are, and the upload still fails
  test("counts the blocks that land around a refused one, and fails the upload", async () => {
    expect.hasAssertions();

    let requestCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn<() => Promise<Response>>(() => {
        requestCount++;
        return Promise.resolve(new Response(null, { status: requestCount === 2 ? 403 : 200 }));
      }),
    );
    const progressNotifier = vi.fn<(progress: number) => void>();

    await expect(
      uploadBlocks(new Blob([new Uint8Array(8 * MEGABYTE + 1)]), sasUrl, progressNotifier),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[BlobStorageStatusError: Invalid operation: Create, name: requestBlobStorage, Blob Storage answered 403]`,
    );
    expect(progressNotifier.mock.calls).toStrictEqual([[1 / 3], [2 / 3]]);
  });

  // A write address lapses an hour after it is handed out, and Blob Storage refuses a request made after that: the
  // Block is refused, the block list is never committed, and the upload fails
  test("An upload to an expired address is refused", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0 });
    const expiredSasUrl = getMockSasUrl(blobUrl, "w", "b", new Date(Date.now() + WRITE_SAS_DURATION_MS));
    vi.setSystemTime(WRITE_SAS_DURATION_MS * 2);
    const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>((url) => {
      const expiresOn = new Date(String(new URL(url).searchParams.get("se")));
      return Promise.resolve(new Response(null, { status: expiresOn < new Date() ? 403 : 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(uploadBlocks(new Blob([" "]), expiredSasUrl)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[BlobStorageStatusError: Invalid operation: Create, name: requestBlobStorage, Blob Storage answered 403]`,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // The control for the refusal above: an address still within its hour takes the blocks and commits the blob
  test("An agent uploads a file before its address expires", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0 });
    const liveSasUrl = getMockSasUrl(blobUrl, "w", "b", new Date(Date.now() + WRITE_SAS_DURATION_MS));
    vi.setSystemTime(WRITE_SAS_DURATION_MS / 2);
    const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>((url) => {
      const expiresOn = new Date(String(new URL(url).searchParams.get("se")));
      return Promise.resolve(new Response(null, { status: expiresOn < new Date() ? 403 : 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    await uploadBlocks(new Blob([" "]), liveSasUrl);
    const [commitUrl] = getCommitCall(fetchMock);

    expect(commitUrl).toBe(`${liveSasUrl}&comp=blocklist`);
  });

  // An empty file has no block to land, so it reports its completion alone
  test("reports an empty file as complete", async () => {
    expect.hasAssertions();

    stubFetch();
    const progressNotifier = vi.fn<(progress: number) => void>();
    await uploadBlocks(new Blob(), sasUrl, progressNotifier);

    expect(progressNotifier.mock.calls).toStrictEqual([[1]]);
  });

  // The create-only header belongs to the commit alone: a block put carrying it would be refused on every block
  test("sends If-None-Match on the commit alone when the upload is create-only", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    const contentType = MimeType.PlainText;
    await uploadBlocks(new Blob([" "], { type: contentType }), sasUrl, undefined, { isCreateOnly: true });
    const [, blockInit] = takeOne(fetchMock.mock.calls);
    const [, commitInit] = getCommitCall(fetchMock);

    expect(blockInit.headers).toStrictEqual({
      "Content-Type": contentType,
      "x-ms-blob-content-type": contentType,
      "x-ms-blob-type": "BlockBlob",
    });
    expect(commitInit.headers).toStrictEqual({
      "Content-Type": MimeType.Xml,
      "If-None-Match": "*",
      "x-ms-blob-content-type": contentType,
    });
  });
});
