import type { runSession as baseRunSession } from "#src/services/coderabbit/collect/runSession";
import type { runGh as baseRunGh } from "#src/services/shared/runGh";

import { DRAIN_FAILED_MARKER, SESSION_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { describe, expect, test, vi } from "vitest";

const { runGh, runSession } = vi.hoisted(() => ({
  runGh: vi.fn<typeof baseRunGh>(),
  runSession: vi.fn<typeof baseRunSession>(),
}));

vi.mock(import("#src/services/coderabbit/collect/runSession"), () => ({
  runSession: runSession as unknown as typeof baseRunSession,
}));

vi.mock(import("#src/services/shared/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(drainFindings, () => {
  const collectorSha = "collectorSha";
  const newestReviewId = 0;
  const viewerLogin = "viewerLogin";

  // A review past the cap that let the cycle port anyway opened the next release over its findings, and that
  // Release merged on its own review with them unread
  test("holds a review whose drain failed past the cap", async () => {
    expect.hasAssertions();

    const failedMarker = getMarker(DRAIN_FAILED_MARKER, newestReviewId, [collectorSha]);
    const issueComments = Array.from({ length: SESSION_ATTEMPT_CAP }, (_value, id) => ({
      body: failedMarker,
      id,
      updated_at: "",
      user: { login: viewerLogin },
    }));

    await expect(
      drainFindings({
        baseSha: "",
        collectorSha,
        feedback: "",
        issueComments,
        newestReviewId,
        openThreads: [],
        pullRequest: 0,
        viewerLogin,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: coderabbit, the drain of review 0 failed 3 times — nothing ports ahead of its open findings until they are answered]`,
    );
    expect(runSession).not.toHaveBeenCalled();
    expect(runGh).toHaveBeenCalledTimes(1);
  });
});
