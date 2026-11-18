import type { WorldChallengeStep } from "#src/models/world/WorldChallengeStep";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { createFrameOptions } from "#src/composables/createFrameOptions.test";
import { useWorldFrame } from "#src/composables/useWorldFrame";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

describe(useWorldFrame, () => {
  // Half a second of the render loop's frame, which it hands the frame in seconds
  const FRAME_SECONDS = 0.5;

  test("steps each challenge by the frame's time in milliseconds, the unit its clock counts", () => {
    expect.hasAssertions();

    startTestWorldSession();
    const stepAbyss = vi.fn<(step: WorldChallengeStep) => void>();
    const stepDomainChallenge = vi.fn<(step: WorldChallengeStep) => string[]>(() => []);
    const stepTrial = vi.fn<(step: WorldChallengeStep) => undefined | WorldJumpPose>(() => undefined);
    const { stepFrame } = useWorldFrame(createFrameOptions({ stepAbyss, stepDomainChallenge, stepTrial }));
    stepFrame({ delta: FRAME_SECONDS, elapsed: 0 });

    const challengeStep = { deltaMilliseconds: 500, isPartyDown: false, isPlaying: true };
    expect(stepAbyss).toHaveBeenCalledExactlyOnceWith(challengeStep);
    expect(stepDomainChallenge).toHaveBeenCalledExactlyOnceWith(challengeStep);
    expect(stepTrial).toHaveBeenCalledExactlyOnceWith(challengeStep);
  });
});
