import type { ContainerClient } from "@azure/storage-blob";
import type { Database } from "@esposter/db-schema";

import { deleteStorageBlobs } from "#src/services/storage/deleteStorageBlobs";
import { RestError } from "@azure/core-rest-pipeline";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";
import { getResultAsync, noop, takeOne } from "@esposter/shared";
import { beforeAll, describe, expect, test } from "vitest";

describe(deleteStorageBlobs, () => {
  let db: Database;

  beforeAll(async () => {
    db = await createMockDb();
  });

  test("rethrows every blob failure of a wave, not only the first", async () => {
    expect.hasAssertions();

    const firstBlobName = crypto.randomUUID();
    const secondBlobName = crypto.randomUUID();
    const firstError = new RestError("a", { statusCode: 503 });
    const secondError = new RestError("b", { statusCode: 500 });
    const rejections: Record<string, RestError> = { [firstBlobName]: firstError, [secondBlobName]: secondError };
    const containerClient = {
      getBlockBlobClient: (blobName: string) => ({
        deleteIfExists: () => Promise.reject(takeOne(rejections, blobName)),
      }),
    } as unknown as ContainerClient;

    const caughtError = await getResultAsync(() =>
      deleteStorageBlobs(db, containerClient, StorageBucket.ResourceAssets, [firstBlobName, secondBlobName], () =>
        Promise.resolve(),
      ),
    ).match(noop, (error: unknown) => error);

    expect(caughtError instanceof AggregateError ? caughtError.errors : []).toStrictEqual([firstError, secondError]);
  });
});
