import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { DRAIN_FAILED_MARKER } from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { describe, expect, test, vi } from "vitest";

const getComment = (body: string, login: string): GitHubEntry => ({
  body,
  id: 0,
  updated_at: new Date(0).toISOString(),
  user: { login },
});

describe(getAttempts, () => {
  const collectorSha = "collectorSha";
  const key = 0;
  const task = "task";
  const viewerLogin = "viewerLogin";
  const marker = getMarker(DRAIN_FAILED_MARKER, key, [collectorSha]);

  // The count and the record have to name one marker in one conversation, or a step counts forever against
  // Attempts nobody wrote down — so the failure it records is the one its own count reads back
  test("records a failure under the marker it counted, numbered after the attempts it read", () => {
    expect.hasAssertions();

    const post = vi.fn<(body: string) => void>();
    const { attempts, recordFailure } = getAttempts({
      collectorSha,
      comments: [getComment(marker, viewerLogin), getComment(marker, "")],
      key,
      marker: DRAIN_FAILED_MARKER,
      post,
      viewerLogin,
    });
    recordFailure(task);

    expect(attempts).toBe(1);
    expect(post.mock.calls).toStrictEqual([[getAttemptFailure({ attempts: 1, marker, task })]]);
  });
});
