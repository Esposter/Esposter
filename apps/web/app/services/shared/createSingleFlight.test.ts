import { createSingleFlight } from "@/services/shared/createSingleFlight";
import { describe, expect, test, vi } from "vitest";

describe(createSingleFlight, () => {
  test("runs one call at a time, a call made in flight running nothing of its own", async () => {
    expect.hasAssertions();
    const firstRun = Promise.withResolvers<void>();
    const run = vi.fn<() => Promise<void>>().mockReturnValueOnce(firstRun.promise);
    const flush = createSingleFlight(run);

    const flushing = flush();
    const joining = flush();
    expect(run).toHaveBeenCalledExactlyOnceWith();
    firstRun.resolve();
    await flushing;
    await joining;
  });

  test("collapses every call made in flight into one trailing run", async () => {
    expect.hasAssertions();
    const firstRun = Promise.withResolvers<void>();
    const run = vi.fn<() => Promise<void>>().mockReturnValueOnce(firstRun.promise).mockResolvedValue(undefined);
    const flush = createSingleFlight(run);

    const flushing = flush();
    flush();
    flush();
    flush();
    firstRun.resolve();
    await flushing;

    expect(run).toHaveBeenCalledTimes(2);
  });

  test("runs nothing more once nothing is owed", async () => {
    expect.hasAssertions();
    const run = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const flush = createSingleFlight(run);

    await flush();
    await flush();

    expect(run).toHaveBeenCalledTimes(2);
  });

  test("clears the flight when a run rejects, so the next call runs", async () => {
    expect.hasAssertions();
    const run = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("The run failed"))
      .mockResolvedValue(undefined);
    const flush = createSingleFlight(run);

    await expect(flush()).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: The run failed]`);
    await flush();

    expect(run).toHaveBeenCalledTimes(2);
  });
});
