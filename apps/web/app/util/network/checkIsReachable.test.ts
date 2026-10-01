import { checkIsReachable } from "@/util/network/checkIsReachable";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(checkIsReachable, () => {
  const url = "https://example.com";
  const timeout = Temporal.Duration.from({ milliseconds: 1 });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("true when the host answers", async () => {
    expect.hasAssertions();

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response()));

    await expect(checkIsReachable(url, timeout)).resolves.toBe(true);
  });

  test("false when the network fails the request", async () => {
    expect.hasAssertions();

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(checkIsReachable(url, timeout)).resolves.toBe(false);
  });

  test("false when the host never answers", async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(
        (_input, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("The operation timed out", "TimeoutError"));
            });
          }),
      ),
    );

    await expect(checkIsReachable(url, timeout)).resolves.toBe(false);
  });
});
