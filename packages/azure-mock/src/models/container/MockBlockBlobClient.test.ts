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

  // A seeded blob reports the seeded etag, so a caller that read one can claim it exactly once
  test("accepts an ifMatch write carrying a seeded blob's etag", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = getClient();

    await expect(
      client.upload("", 0, { conditions: { ifMatch: MOCK_BLOB_SEEDED_PROPERTIES.etag } }),
    ).resolves.toMatchObject({ _response: { status: 201 } });
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

  // GetProperties and a listing describe the same blob, so seeded content reads as pre-existing on both
  test("reports a seeded blob's dates from getProperties", async () => {
    expect.hasAssertions();

    MockContainerDatabase.set(containerName, new Map([[blobName, Buffer.from("")]]));
    const client = getClient();

    await expect(client.getProperties()).resolves.toMatchObject(MOCK_BLOB_SEEDED_PROPERTIES);
  });
});
