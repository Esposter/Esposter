import { MOCK_BLOB_BASE_URL } from "@/constants";
import { MockBlobBatchClient } from "@/models/container/MockBlobBatchClient";
import { MockContainerDatabase } from "@/store/MockContainerDatabase";
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

    const unencodedBlobName = "my photo.png";
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

  // A lone `%` is legal in a blob name and is not valid percent-encoding, so decoding it must not throw — a throw
  // Would reject the whole batch rather than the one blob it names
  test("deletes the rest of the batch when one name is not valid percent-encoding", async () => {
    expect.hasAssertions();

    const malformedBlobName = "100%.png";
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
});
