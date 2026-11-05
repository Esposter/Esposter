import type { KitContext } from "#src/models/kit/KitContext";
import type { WorldChallengeStep } from "#src/models/world/WorldChallengeStep";
import type { WorldFrameOptions } from "#src/models/world/WorldFrameOptions";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Input } from "genshin-engine";

import { useWorldFrame } from "#src/composables/useWorldFrame";
import { createParty } from "#src/services/party/createParty";
import { startTestWorldSession } from "#src/store/session.fixture";
import { createIdleInputState } from "genshin-engine";
import { Object3D } from "three";
import { ref } from "vue";
import { describe, expect, test, vi } from "vitest";

// Each step of the frame as a no-op, over a character on the field with nothing in reach and an input holding nothing, so
// A test overrides only the step it watches
const createFrameOptions = (overrides: Partial<WorldFrameOptions> = {}): WorldFrameOptions => {
  const inputState = createIdleInputState();
  const input: Input = {
    dispose: () => {},
    press: () => {},
    readInput: () => inputState,
    release: () => {},
    setTouchStick: () => {},
    turn: () => {},
  };
  return {
    abyssChoices: ref(undefined),
    characterBody: new Object3D(),
    checkIsPaused: () => false,
    closeShortcutWheel: () => {},
    dispatchInteraction: () => {},
    domainClaimOffers: ref(undefined),
    drawDayOutcrops: () => {},
    elementalSight: { isOn: false, origin: { x: 0, z: 0 }, spreadSeconds: 0 },
    getEquippedGadgetCooldown: () => 0,
    getMemberMaxHealth: () => undefined,
    hudFrame: { gadgetCooldown: 0, pivotX: 0, pivotY: 0, seconds: 0, sheerCold: 0, stamina: 0 },
    input,
    inputState,
    interactionPrompts: ref({ interactables: [], selectedId: "", windowStart: 0 }),
    isHudHidden: ref(false),
    // Only the frame's random source is read, by the steps that are no-ops here
    kitContext: { random: () => 0 } as unknown as KitContext,
    party: createParty([1, 2]),
    placeUsedGadget: () => {},
    readInteraction: () => undefined,
    refreshMiningOutcrops: () => {},
    showCursor: () => {},
    stepAbyss: () => {},
    stepAutoRecover: () => {},
    stepDomainChallenge: () => [],
    stepFishing: () => {},
    stepMenuNavigation: () => {},
    stepQuickUse: () => undefined,
    stepShortcutWheel: () => {},
    stepTrial: () => undefined,
    touchOutcropsNear: () => {},
    ...overrides,
  };
};

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
