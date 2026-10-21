import { MimeType } from "#shared/models/file/MimeType";
import { commitBlockList } from "@/services/azure/container/commitBlockList";
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

describe(commitBlockList, () => {
  const sasUrl = getMockSasUrl("", "w", "b");
  const blockIds = [""];

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // A create-only commit is refused with 412 when the blob already exists, which is the only thing this header asks for
  test("sends If-None-Match on the commit when it is create-only", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    await commitBlockList(sasUrl, blockIds, MimeType.PlainText, { isCreateOnly: true });
    const [, commitInit] = takeOne(fetchMock.mock.calls);

    expect(commitInit.headers).toStrictEqual({
      "Content-Type": MimeType.Xml,
      "If-None-Match": "*",
      "x-ms-blob-content-type": MimeType.PlainText,
    });
  });

  // An overwriting commit is the default, so nothing in its headers changes unless a caller asks for create-only
  test("sends no If-None-Match on the commit by default", async () => {
    expect.hasAssertions();

    const fetchMock = stubFetch();
    await commitBlockList(sasUrl, blockIds, MimeType.PlainText);
    const [, commitInit] = takeOne(fetchMock.mock.calls);

    expect(commitInit.headers).toStrictEqual({
      "Content-Type": MimeType.Xml,
      "x-ms-blob-content-type": MimeType.PlainText,
    });
  });
});
