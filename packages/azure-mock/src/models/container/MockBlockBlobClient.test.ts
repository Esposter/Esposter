import type { BlobDownloadResponseParsed } from "@azure/storage-blob";

import { MOCK_BLOB_BASE_URL } from "#src/constants";
import { MockBlockBlobClient } from "#src/models/container/MockBlockBlobClient";
import { MOCK_BLOB_SEEDED_PROPERTIES } from "#src/services/container/constants";
import { readMockBlobMetadata } from "#src/services/container/readMockBlobMetadata";
import { MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";
import { MockContainerBlobMetadataDatabase } from "#src/store/MockContainerBlobMetadataDatabase";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { afterEach, assert, describe, expect, test } from "vitest";

const readDownloadBody = async ({ readableStreamBody }: BlobDownloadResponseParsed) => {
  assert.exists(readableStreamBody);
  return Buffer.concat(await Array.fromAsync(readableStreamBody, (chunk) => Buffer.from(chunk))).toString();
};

describe(MockBlockBlobClient, () => {
  const blobName = "blobName";
  const containerName = "containerName";
  const metadata = { reason: "reason" };
  const getClient = () => new MockBlockBlobClient(MOCK_BLOB_BASE_URL, containerName, blobName);

  afterEach(() => {
    MockContainerDatabase.clear();
    MockContainerBlobDatesDatabase.clear();
    MockContainerBlobMetadataDatabase.clear();
  });

  // A blob is its content plus the records keyed to it, and the blob client's delete takes all of them the way
  // The container client's does — or the next blob seeded under the name inherits metadata it never carried
  test.for(["delete", "deleteIfExists"] as const)("%s clears the blob's metadata", async (method) => {
    expect.hasAssertions();

    const client = getClient();
    await client.upload("", 0, { metadata });

    expect(readMockBlobMetadata(containerName, blobName)).toStrictEqual(metadata);

    await client[method]();

    expect(readMockBlobMetadata(containerName, blobName)).toBeUndefined();
  });

  // A download answers the ETag and the body of one response, so a caller reading both pairs each body with the ETag its
  // Write minted, and a later write replaces the two together
  test("answers the ETag and the body of one download, which a later write replaces together", async () => {
    expect.hasAssertions();

    const client = getClient();
    const { etag: firstEtag } = await client.upload("first", 5);
    const firstDownload = await client.download();
    const { etag: secondEtag } = await client.upload("second", 6);
    const secondDownload = await client.download();

    expect([firstDownload.etag, await readDownloadBody(firstDownload)]).toStrictEqual([firstEtag, "first"]);
    expect([secondDownload.etag, await readDownloadBody(secondDownload)]).toStrictEqual([secondEtag, "second"]);
  });

  // A seeded blob reports the seeded etag, so a caller that read one can claim it exactly once: the write mints a
  // Real etag for the blob, so the seeded value is spent and the second claim loses the race it is meant to lose
  test("accepts an ifMatch write carrying a seeded blob's etag exactly once", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = getClient();

    // The first write resolving is the assertion — the mock returns one hardcoded status whatever the
    // Conditions were, so a status check would say nothing about the etag being spent
    await client.upload("", 0, { conditions: { ifMatch: MOCK_BLOB_SEEDED_PROPERTIES.etag } });

    await expect(
      client.upload("", 0, { conditions: { ifMatch: MOCK_BLOB_SEEDED_PROPERTIES.etag } }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: The condition specified using HTTP conditional header(s) is not met.]`,
    );
  });

  // The etag of a blob that is not there is nobody's to hold: falling back to the seeded value would let a
  // Worker win the claim on a blob another one has since deleted, and recreate it
  test("refuses an ifMatch write against an absent blob", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map());
    const client = getClient();

    await expect(
      client.upload("", 0, { conditions: { ifMatch: MOCK_BLOB_SEEDED_PROPERTIES.etag } }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: The condition specified using HTTP conditional header(s) is not met.]`,
    );
  });

  // A listing and `getProperties` describe the same blob, so seeded content reads as pre-existing on both
  test("reports a seeded blob's dates from getProperties", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = getClient();

    const properties = await client.getProperties();

    expect(properties.createdOn).toStrictEqual(MOCK_BLOB_SEEDED_PROPERTIES.createdOn);
    expect(properties.etag).toBe(MOCK_BLOB_SEEDED_PROPERTIES.etag);
    expect(properties.lastModified).toStrictEqual(MOCK_BLOB_SEEDED_PROPERTIES.lastModified);
  });
});
