import { deleteDirectory } from "#src/services/storage/deleteDirectory";
import { listBlobNames } from "#src/services/storage/listBlobNames";
import { setupMockBucket } from "@esposter/db-mock/vitest";
import { beforeAll, describe, expect, test } from "vitest";

describe(deleteDirectory, () => {
  const prefix = "prefix";
  // Five objects under pages of two: the listing takes three pages, the last one holding the odd object
  const blobNames = Array.from({ length: 5 }, (_value, index) => `${prefix}/${index}`);
  const { getBucket } = setupMockBucket("resource-assets");

  beforeAll(async () => {
    const bucket = getBucket();
    await Promise.all(blobNames.map((blobName) => bucket.put(blobName, "")));
  });

  // The listing pages by the size it is given, so a prefix longer than one page is still removed whole
  test("removes every object under the prefix across pages of the size it is given, and leaves the rest", async () => {
    expect.hasAssertions();

    const bucket = getBucket();
    await bucket.put("other/kept", "");
    // Counts the listing's pages through the bucket it is given, since the mock's methods do not take a spy
    const pages: unknown[][] = [];
    const countingBucket = new Proxy(bucket, {
      get: (target, property) => {
        const value: unknown = Reflect.get(target, property, target);
        if (typeof value !== "function") return value;
        if (property === "list")
          return (...args: unknown[]) => {
            pages.push(args);
            return Reflect.apply(value, target, args);
          };
        return value.bind(target);
      },
    });
    await deleteDirectory(countingBucket, prefix, 2);

    expect(pages).toHaveLength(3);
    await expect(listBlobNames(bucket, prefix)).resolves.toStrictEqual([]);
    await expect(listBlobNames(bucket, "other")).resolves.toStrictEqual(["other/kept"]);
  });
});
