import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";
import type { runGit } from "#src/services/shared/runGit";

import { reviewBatch } from "#src/services/review/reviewBatch";
import { reviewWindows } from "#src/services/review/reviewWindows";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/review/reviewBatch"), () => ({ reviewBatch: vi.fn<typeof reviewBatch>() }));
vi.mock(import("#src/services/shared/runGit"), () => ({ runGit: vi.fn<typeof runGit>() }));

describe(reviewWindows, () => {
  const BATCH_COUNT = 30;
  const windows: ReviewWindow[] = [
    { base: "", batches: Array.from({ length: BATCH_COUNT }, () => []), commitShas: [], end: "" },
  ];

  const settle = async () => {
    const settled: ReviewBatchOutcome[][] = [];
    await reviewWindows(windows, Number.POSITIVE_INFINITY, (_windowIndex, outcomes) => {
      settled.push(outcomes);
    });
    return settled;
  };

  test("a batch that errors leaves every batch not yet started unreached", async () => {
    expect.hasAssertions();

    vi.mocked(reviewBatch).mockResolvedValue({ error: new Error(" ") });

    const [outcomes] = await settle();

    expect(reviewBatch).toHaveBeenCalledTimes(1);
    expect(outcomes?.filter((outcome) => "isUnreached" in outcome)).toHaveLength(BATCH_COUNT - 1);
  });

  test("batches that answer all run", async () => {
    expect.hasAssertions();

    vi.mocked(reviewBatch).mockResolvedValue({ findings: [] });

    const [outcomes] = await settle();

    expect(reviewBatch).toHaveBeenCalledTimes(BATCH_COUNT);
    expect(outcomes?.every((outcome) => "findings" in outcome)).toBe(true);
  });
});
