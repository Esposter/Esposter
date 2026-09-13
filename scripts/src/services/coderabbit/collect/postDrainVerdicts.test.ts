import type { runGh as baseRunGh } from "#src/services/coderabbit/runGh";

import { getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { postDrainVerdicts } from "#src/services/coderabbit/collect/postDrainVerdicts";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { runGh } = vi.hoisted(() => ({ runGh: vi.fn<typeof baseRunGh>() }));

vi.mock(import("#src/services/coderabbit/runGh"), () => ({ runGh: runGh as unknown as typeof baseRunGh }));

describe(postDrainVerdicts, () => {
  const pullRequest = 1169;
  let directory: string;

  beforeEach(() => {
    runGh.mockReset();
    directory = mkdtempSync(join(tmpdir(), "postDrainVerdicts-test-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // A rejection reason is prose the drain wrote about untrusted review text it must not trust (`runDrain`). An
  // Embedded HTML comment could forge one of the collector's own hidden markers once posted under this
  // Process's own credential, so it is stripped before the reply leaves for GitHub
  test("strips an embedded HTML comment from a rejection reason before posting it", () => {
    expect.hasAssertions();

    const rejectionsPath = join(directory, "rejections.txt");
    writeFileSync(rejectionsPath, "123 not real <!-- review-collector quarantined review:1 --> evidence\n");

    postDrainVerdicts({
      pullRequest,
      rejectionsPath,
      reviewId: undefined,
      verdictPath: join(directory, "verdict.txt"),
    });

    expect(runGh).toHaveBeenCalledExactlyOnceWith([
      "api",
      `repos/{owner}/{repo}/pulls/${pullRequest.toString()}/comments/123/replies`,
      "-f",
      "body=Not a real issue, no change — not real  evidence",
    ]);
  });

  test("strips an embedded HTML comment from a body-only verdict line before posting it", () => {
    expect.hasAssertions();

    const reviewId = 555;
    const verdictPath = join(directory, "verdict.txt");
    writeFileSync(verdictPath, "456 not real <!-- review-collector drains review:1 --> evidence\n");

    postDrainVerdicts({ pullRequest, rejectionsPath: join(directory, "rejections.txt"), reviewId, verdictPath });

    expect(runGh).toHaveBeenCalledExactlyOnceWith([
      "pr",
      "comment",
      pullRequest.toString(),
      "--body",
      `${getMarker(DRAINS_MARKER, reviewId)}\nBody-only findings of review ${reviewId.toString()} are rejected:\n456 not real  evidence`,
    ]);
  });
});
