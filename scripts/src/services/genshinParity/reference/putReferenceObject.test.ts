import { createMemoryR2BucketClient } from "#src/services/cloudflare/createMemoryR2BucketClient.test";
import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { describe, expect, test, vi } from "vitest";

describe(putReferenceObject, () => {
  const KEY = "parityObjects/0.webp";

  test("uploads only to the buckets that lack the object", async () => {
    expect.hasAssertions();

    const lacking = createMemoryR2BucketClient();
    const holding = createMemoryR2BucketClient();
    await holding.put(KEY, new Blob());

    const uploads = await putReferenceObject(KEY, new Blob(), [lacking, holding]);

    expect(uploads).toBe(1);
    expect([...lacking.store.keys()]).toStrictEqual([KEY]);
    expect(holding.store.size).toBe(1);
  });

  test("never uploads an object a bucket already holds", async () => {
    expect.hasAssertions();

    const holding = createMemoryR2BucketClient();
    await holding.put(KEY, new Blob());
    const put = vi.spyOn(holding, "put");
    const uploads = await putReferenceObject(KEY, new Blob(), [holding]);

    expect(uploads).toBe(0);
    expect(put).not.toHaveBeenCalled();
  });
});
