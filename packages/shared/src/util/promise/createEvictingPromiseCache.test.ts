import { createEvictingPromiseCache } from "#src/util/promise/createEvictingPromiseCache";
import { describe, expect, test, vi } from "vitest";

describe(createEvictingPromiseCache, () => {
  test("shares one load between concurrent callers of a key", async () => {
    expect.hasAssertions();

    const load = vi.fn<(key: string) => Promise<string>>((key) => Promise.resolve(`value of ${key}`));
    const getValue = createEvictingPromiseCache((key: string) => key, load);

    await expect(Promise.all([getValue("a"), getValue("a"), getValue("b")])).resolves.toStrictEqual([
      "value of a",
      "value of a",
      "value of b",
    ]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  // A failed load would otherwise stay the answer for its key for as long as the process runs
  test("retries a key whose load rejected", async () => {
    expect.hasAssertions();

    const load = vi
      .fn<(key: string) => Promise<string>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce("value");
    const getValue = createEvictingPromiseCache((key: string) => key, load);

    await expect(getValue("a")).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: offline]`);
    await expect(getValue("a")).resolves.toBe("value");
    expect(load).toHaveBeenCalledTimes(2);
  });
});
