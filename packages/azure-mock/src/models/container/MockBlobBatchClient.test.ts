import { MOCK_BLOB_BASE_URL } from "#src/constants";
import { MockBlobBatchClient } from "#src/models/container/MockBlobBatchClient";
import { MockContainerClient } from "#src/models/container/MockContainerClient";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { AnonymousCredential } from "@azure/storage-blob";
import { afterEach, describe, expect, test } from "vitest";

describe(MockBlobBatchClient, () => {
  const blobName = "blobName";
  const containerName = "containerName";

  afterEach(() => {
    MockContainerDatabase.clear();
  });

  test("reports a malformed blob url as a single failed sub-response", async () => {
    expect.hasAssertions();

    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs([MOCK_BLOB_BASE_URL], new AnonymousCredential());

    expect(response.subResponses).toHaveLength(1);
    expect(response.subResponsesFailedCount).toBe(1);
    expect(response.subResponsesSucceededCount).toBe(0);
  });

  test("deletes an existing blob as a single succeeded sub-response", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      [`${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`],
      new AnonymousCredential(),
    );

    expect(response.subResponses).toHaveLength(1);
    expect(response.subResponsesFailedCount).toBe(0);
    expect(response.subResponsesSucceededCount).toBe(1);
    expect(MockContainerDatabase.get(containerName)?.has(blobName)).toBe(false);
  });

  test("deletes a blob whose name the url percent-encodes", async () => {
    expect.hasAssertions();

    const unencodedBlobName = " a";
    MockContainerDatabase.set(containerName, new Map([[unencodedBlobName, Buffer.from("")]]));
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      [`${MOCK_BLOB_BASE_URL}/${containerName}/${unencodedBlobName}`],
      new AnonymousCredential(),
    );

    expect(response.subResponsesFailedCount).toBe(0);
    expect(response.subResponsesSucceededCount).toBe(1);
    expect(MockContainerDatabase.get(containerName)?.has(unencodedBlobName)).toBe(false);
  });

  // A url `URL` cannot parse at all takes the same route as one naming no blob: the sub-response for that url, not
  // A throw that rejects every other deletion in the batch
  test("deletes the rest of the batch when one url is unparseable", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      ["", `${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`],
      new AnonymousCredential(),
    );

    expect(response.subResponsesFailedCount).toBe(1);
    expect(response.subResponsesSucceededCount).toBe(1);
    expect(MockContainerDatabase.get(containerName)?.has(blobName)).toBe(false);
  });

  // A lone `%` is legal in a blob name and is not valid percent-encoding, so decoding it must not throw — a throw
  // Would reject the whole batch rather than the one blob it names
  test("deletes the rest of the batch when one name is not valid percent-encoding", async () => {
    expect.hasAssertions();

    const malformedBlobName = "%";
    MockContainerDatabase.set(
      containerName,
      new Map([
        [blobName, Buffer.from("")],
        [malformedBlobName, Buffer.from("")],
      ]),
    );
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      [
        `${MOCK_BLOB_BASE_URL}/${containerName}/${malformedBlobName}`,
        `${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`,
      ],
      new AnonymousCredential(),
    );

    expect(response.subResponsesSucceededCount).toBe(2);
    expect(MockContainerDatabase.get(containerName)?.size).toBe(0);
  });

  // A conditional delete names the instant it was last listed at. A blob written after it has changed since, so it is
  // Kept and reported as a failed sub-response, which is what a sweep reads as the blob having been rewritten
  test("keeps a blob modified after ifUnmodifiedSince as a failed sub-response", async () => {
    expect.hasAssertions();

    await new MockContainerClient("", containerName).getBlockBlobClient(blobName).upload(Buffer.from(""), 0);
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      [`${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`],
      new AnonymousCredential(),
      { conditions: { ifUnmodifiedSince: new Date(0) } },
    );

    expect(response.subResponses.map(({ status }) => status)).toStrictEqual([412]);
    expect(response.subResponsesFailedCount).toBe(1);
    expect(MockContainerDatabase.get(containerName)?.has(blobName)).toBe(true);
  });

  test("deletes a blob not modified after ifUnmodifiedSince", async () => {
    expect.hasAssertions();

    await new MockContainerClient("", containerName).getBlockBlobClient(blobName).upload(Buffer.from(""), 0);
    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);
    const response = await client.deleteBlobs(
      [`${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`],
      new AnonymousCredential(),
      { conditions: { ifUnmodifiedSince: new Date(8_640_000_000_000_000) } },
    );

    expect(response.subResponses.map(({ status }) => status)).toStrictEqual([202]);
    expect(MockContainerDatabase.get(containerName)?.has(blobName)).toBe(false);
  });

  // A condition the mock does not reproduce would be dropped without a trace, so the call refuses it outright
  test("refuses a condition other than ifUnmodifiedSince", async () => {
    expect.hasAssertions();

    const client = new MockBlobBatchClient(MOCK_BLOB_BASE_URL);

    await expect(
      client.deleteBlobs([`${MOCK_BLOB_BASE_URL}/${containerName}/${blobName}`], new AnonymousCredential(), {
        conditions: { ifMatch: '"etag"' },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[NotImplementedError: deleteBlobs with ifMatch is not implemented in the mock]`,
    );
  });
});
