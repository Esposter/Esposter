import type { RecordObjectTarget } from "#src/models/genshinParity/reference/RecordObjectTarget";

import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { describe, expect, test, vi } from "vitest";

describe(putReferenceObject, () => {
  const BLOB_NAME = "parityReferences/0.webp";
  const LOCAL_PATH = "0.webp";
  // A fake account that holds the names it is given, and records every upload it is asked for
  const createTarget = (held: string[]): RecordObjectTarget & { uploads: string[] } => {
    const uploads: string[] = [];
    return {
      exists: vi.fn((blobName: string) => Promise.resolve(held.includes(blobName))),
      upload: vi.fn((blobName: string) => {
        uploads.push(blobName);
        return Promise.resolve();
      }),
      uploads,
    };
  };

  test("uploads only to the accounts that lack the object", async () => {
    expect.hasAssertions();
    const lacking = createTarget([]);
    const holding = createTarget([BLOB_NAME]);
    const uploads = await putReferenceObject(BLOB_NAME, LOCAL_PATH, [lacking, holding]);
    expect(uploads).toBe(1);
    expect(lacking.uploads).toStrictEqual([BLOB_NAME]);
    expect(holding.uploads).toStrictEqual([]);
  });

  test("never uploads an object an account already holds", async () => {
    expect.hasAssertions();
    const target = createTarget([BLOB_NAME]);
    const uploads = await putReferenceObject(BLOB_NAME, LOCAL_PATH, [target]);
    expect(uploads).toBe(0);
    expect(target.upload).not.toHaveBeenCalled();
  });
});
