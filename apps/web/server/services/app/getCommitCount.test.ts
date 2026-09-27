import { getCommitCount } from "@@/server/services/app/getCommitCount";
import { describe, expect, test, vi } from "vitest";

describe(getCommitCount, () => {
  // A public procedure reads this, so a read per call would spend GitHub's per-address budget for every visitor
  test("asks GitHub once per process", async () => {
    expect.hasAssertions();

    const commitCount = 1;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { headers: { Link: `<?page=${commitCount}>; rel="last"` } }));
    await getCommitCount();

    await expect(getCommitCount()).resolves.toBe(commitCount);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
