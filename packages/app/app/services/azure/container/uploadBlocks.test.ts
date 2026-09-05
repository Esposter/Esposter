import { MimeType } from "#shared/models/file/MimeType";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { takeOne } from "@esposter/shared";
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
  const sasUrl = "https://mock/blob?sig=mock";

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Put Block List is the only request in the upload that sets the blob's own headers, so sending its XML
  // Body's type as the blob's stores every upload as XML whatever was in it
  test("stores the blob under the file's own content type", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    const contentType = "image/png";
    await uploadBlocks(new Blob(["mock"], { type: contentType }), sasUrl);
    const [commitUrl, commitInit] = getCommitCall(fetchMock);

    expect(commitUrl).toContain("comp=blocklist");
    expect(commitInit.headers).toStrictEqual({
      "Content-Type": MimeType.Xml,
      "x-ms-blob-content-type": contentType,
    });
  });

  // A file the browser could not type at all — no blob header beats one that is certainly wrong
  test("sends no blob content type for a file that has none", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    await uploadBlocks(new Blob(["mock"]), sasUrl);
    const [, commitInit] = getCommitCall(fetchMock);

    expect(commitInit.headers).toStrictEqual({ "Content-Type": MimeType.Xml });
  });
});
