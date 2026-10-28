import type { ContainerClient } from "@azure/storage-blob";
import type { Database } from "@esposter/db-schema";

import { cloneFiles } from "#src/services/azure/container/cloneFiles";
import { getThumbnailBlobName } from "#src/services/azure/container/getThumbnailBlobName";
import { createUser } from "#src/services/message/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, FileEntity, storageLedgerInStorage, usersInAuth } from "@esposter/db-schema";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(cloneFiles, () => {
  let db: Database;
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.MessageAssets;
  const containerUrl = "";
  const sourcePrefix = crypto.randomUUID();
  const destinationPrefix = crypto.randomUUID();
  const id = crypto.randomUUID();
  const filename = "a";

  // Records the copy source the destination client was handed, which is the whole invariant: it has to be
  // The SDK's own percent-encoded url and never an interpolation of the raw name. `rejectSource` fails the one copy
  // Whose source ends with it, so a partial clone can be driven without faking the client's shape.
  beforeAll(async () => {
    db = await createMockDb();
    await db.insert(usersInAuth).values(createUser(userId, new Date(0), "name"));
  });

  afterEach(async () => {
    await db.delete(storageLedgerInStorage);
    await db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
  });

  const setupContainerClient = (rejectSource = "") => {
    const beginCopyFromURL = vi.fn<(copySource: string) => Promise<{ pollUntilDone: () => Promise<void> }>>(
      (copySource) =>
        rejectSource && copySource.endsWith(rejectSource)
          ? Promise.reject(new Error(" "))
          : Promise.resolve({ pollUntilDone: () => Promise.resolve() }),
    );
    const deletedBlobNames: string[] = [];
    const containerClient = {
      getBlockBlobClient: (blobName: string) => ({
        beginCopyFromURL,
        deleteIfExists: () => {
          deletedBlobNames.push(blobName);
          return Promise.resolve({ succeeded: true });
        },
        getProperties: () => Promise.resolve({ contentLength: 1 }),
        url: `${containerUrl}/${blobName
          .split("/")
          .map((segment) => encodeURIComponent(segment))
          .join("/")}`,
      }),
      url: containerUrl,
    } as unknown as ContainerClient;
    return { beginCopyFromURL, containerClient, deletedBlobNames };
  };

  test("copies from the sdk's encoded url, so a name holding a url delimiter is not truncated", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    await cloneFiles(
      db,
      userId,
      containerName,
      containerClient,
      [new FileEntity({ filename: "#", id })],
      sourcePrefix,
      destinationPrefix,
    );

    // Interpolated, the `#` would start a fragment and Azure would receive a source ending at the separator.
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${sourcePrefix}/${id}%7C%23`);
  });

  test("copies the sibling thumbnail and reports it, so a clone never claims one that was not written", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    const [clonedFile] = await cloneFiles(
      db,
      userId,
      containerName,
      containerClient,
      [new FileEntity({ filename, hasThumbnail: true, id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(true);
    expect(beginCopyFromURL).toHaveBeenCalledWith(`${containerUrl}/${getThumbnailBlobName(sourcePrefix, id)}`);
  });

  // The caller treats a rejection as "nothing was cloned" — the forward posts no message — so anything already
  // Written is referenced by nothing, and the retry mints a fresh id rather than overwriting it.
  test("clears what it wrote when the thumbnail copy fails", async () => {
    expect.hasAssertions();

    const { containerClient, deletedBlobNames } = setupContainerClient(getThumbnailBlobName(sourcePrefix, id));

    await expect(
      cloneFiles(
        db,
        userId,
        containerName,
        containerClient,
        [new FileEntity({ filename, hasThumbnail: true, id })],
        sourcePrefix,
        destinationPrefix,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(deletedBlobNames).toHaveLength(1);
    expect(takeOne(deletedBlobNames).endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
  });

  test("clears a sibling's clone when another file in the batch fails", async () => {
    expect.hasAssertions();

    const failingId = crypto.randomUUID();
    const failingFilename = "b";
    // The copy source is the percent-encoded url, so the suffix has to be encoded the same way the client is
    const { containerClient, deletedBlobNames } = setupContainerClient(
      encodeURIComponent(`${failingId}${ID_SEPARATOR}${failingFilename}`),
    );

    await expect(
      cloneFiles(
        db,
        userId,
        containerName,
        containerClient,
        [new FileEntity({ filename, id }), new FileEntity({ filename: failingFilename, id: failingId })],
        sourcePrefix,
        destinationPrefix,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    // Only the sibling that landed — the failing copy wrote nothing to clear
    expect(deletedBlobNames).toHaveLength(1);
    expect(takeOne(deletedBlobNames).endsWith(`${ID_SEPARATOR}${filename}`)).toBe(true);
    // The sibling's charge goes with its blob, and the failing copy's charge went back when its copy failed
    await expect(db.query.storageLedgerInStorage.findMany()).resolves.toStrictEqual([]);
  });

  test("copies only the original when the source recorded no thumbnail", async () => {
    expect.hasAssertions();

    const { beginCopyFromURL, containerClient } = setupContainerClient();

    const [clonedFile] = await cloneFiles(
      db,
      userId,
      containerName,
      containerClient,
      [new FileEntity({ filename, id })],
      sourcePrefix,
      destinationPrefix,
    );

    expect(clonedFile?.hasThumbnail).toBe(false);
    expect(beginCopyFromURL).toHaveBeenCalledTimes(1);
  });
});
