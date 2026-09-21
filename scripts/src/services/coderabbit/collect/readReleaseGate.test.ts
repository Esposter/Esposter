import type { readAnswers as baseReadAnswers } from "#src/services/jev/readAnswers";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";
import { readReleaseGate } from "#src/services/coderabbit/collect/readReleaseGate";
import { HIGH_STAKES_CONFIDENCE } from "#src/services/jev/constants";
import { describe, expect, test, vi } from "vitest";

const { readAnswers } = vi.hoisted(() => ({ readAnswers: vi.fn<typeof baseReadAnswers>() }));

vi.mock(import("#src/services/jev/readAnswers"), () => ({
  readAnswers: readAnswers as unknown as typeof baseReadAnswers,
}));

describe(readReleaseGate, () => {
  const input = { answers: [], feedback: "feedback", riskBlock: "riskBlock" };
  // One step inside the band, off either edge
  const bandStep = 0.01;
  const answerWith = (probability: number) => {
    readAnswers.mockResolvedValue({ isOpen: { noul: probability, type: "noul" } } as never);
  };

  // Both verdicts are written to the pull request, so both sit at the high-stakes bar and the band between them
  // Is the session's — which is the one outcome a reading of the text alone may not settle
  test.each([
    [0, ReleaseVerdict.Merge],
    [1 - HIGH_STAKES_CONFIDENCE, ReleaseVerdict.Merge],
    [1, ReleaseVerdict.Hold],
    [HIGH_STAKES_CONFIDENCE, ReleaseVerdict.Hold],
  ])("decides %f as %s", async (probability, verdict) => {
    expect.hasAssertions();

    answerWith(probability);

    await expect(readReleaseGate(input)).resolves.toStrictEqual({
      reason: expect.stringContaining(`jev ${probability.toFixed(2)}`),
      verdict,
    });
  });

  test.each([0.5, 1 - HIGH_STAKES_CONFIDENCE + bandStep, HIGH_STAKES_CONFIDENCE - bandStep])(
    "escalates %f to the session",
    async (probability) => {
      expect.hasAssertions();

      answerWith(probability);

      await expect(readReleaseGate(input)).resolves.toBeUndefined();
    },
  );

  // No key, or a tier that failed: the verdict is the session's, as it was before there was a gate
  test("escalates when the tier answers nothing", async () => {
    expect.hasAssertions();

    readAnswers.mockResolvedValue(undefined);

    await expect(readReleaseGate(input)).resolves.toBeUndefined();
  });
});
