import { MOCK_BLOB_BASE_URL } from "#src/constants";
import { MockBlockBlobClient } from "#src/models/container/MockBlockBlobClient";
import { MOCK_BLOB_SEEDED_PROPERTIES, MockContainerBlobDatesDatabase } from "#src/store/MockContainerBlobDatesDatabase";
import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { afterEach, describe, expect, test } from "vitest";

describe(MockBlockBlobClient, () => {
  const blobName = "blobName";
  const containerName = "containerName";
  const getClient = () => new MockBlockBlobClient(MOCK_BLOB_BASE_URL, containerName, blobName);

  afterEach(() => {
    MockContainerDatabase.clear();
    MockContainerBlobDatesDatabase.clear();
  });

  // A seeded blob reports the seeded etag, so a caller that read one can claim it exactly once: the write mints a
  // Real etag for the blob, so the seeded value is spent and the second claim loses the race it is meant to lose
  test("accepts an ifMatch write carrying a seeded blob's etag exactly once", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = getClient();

    const uploadResponse = await client.upload("", 0, {
      conditions: { ifMatch: MOCK_BLOB_SEEDED_PROPERTIES.etag },
    });

    expect(uploadResponse._response.status).toBe(201);

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
