import type { KitContext } from "#src/models/kit/KitContext";
import type { WorldFrameOptions } from "#src/models/world/WorldFrameOptions";
import type { Input, InputState } from "genshin-engine";

import { useWorldFrame } from "#src/composables/useWorldFrame";
import { createParty } from "#src/services/party/createParty";
import { startTestWorldSession } from "#src/store/session.fixture";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { createIdleInputState, InputAction } from "genshin-engine";
import { Object3D } from "three";
import { describe, test } from "vitest";
import { ref } from "vue";

// One frame of the render loop at sixty frames a second
const FRAME_SECONDS = 1 / 60;
// A run of the recorded walk: how many frames it lasts, what its first frame presses, what it holds through its frames,
// And the move and menu axes it holds. Each walk step is a player's gesture in the world, from standing still to opening
// The Paimon menu, and the walk returns to the world with every toggle and the party back where it started, so each
// Iteration plays the same branches
interface WalkStep {
  frames: number;
  held?: readonly InputAction[];
  lookYaw?: number;
  menuDown?: number;
  moveForward?: number;
  moveRight?: number;
  pressed?: readonly InputAction[];
}
const WALK_STEPS: readonly WalkStep[] = [
  { frames: 60 },
  { frames: 240, lookYaw: 0.01, moveForward: 1, moveRight: 0.25 },
  { frames: 1, pressed: [InputAction.SwitchToPartyMember2] },
  { frames: 90 },
  { frames: 1, pressed: [InputAction.ElementalSight] },
  { frames: 30, moveForward: 1 },
  { frames: 1, pressed: [InputAction.ElementalSight] },
  { frames: 60, held: [InputAction.NormalAttack], pressed: [InputAction.NormalAttack] },
  { frames: 60, held: [InputAction.OpenShortcutWheel], moveForward: 0.5, moveRight: -0.5 },
  { frames: 1, pressed: [InputAction.OpenPaimonMenu] },
  { frames: 60, menuDown: 1 },
  { frames: 1, pressed: [InputAction.Cancel] },
  { frames: 1, pressed: [InputAction.HideInterface] },
  { frames: 30 },
  { frames: 1, pressed: [InputAction.HideInterface] },
  { frames: 1, pressed: [InputAction.ShowCursor] },
  { frames: 1, pressed: [InputAction.QuestNavigation] },
  { frames: 1, pressed: [InputAction.Interact] },
  { frames: 90 },
  { frames: 1, pressed: [InputAction.SwitchToPartyMember1] },
  { frames: 60 },
];
// The walk's inputs, each the state the input reads for its frame, built once and read by every iteration
const WALK_INPUTS: readonly InputState[] = WALK_STEPS.flatMap(
  ({ frames, held = [], lookYaw = 0, menuDown = 0, moveForward = 0, moveRight = 0, pressed = [] }) =>
    Array.from({ length: frames }, (_, index) => ({
      ...createIdleInputState(),
      heldActions: new Set(held),
      lookYaw,
      menuDown,
      moveForward,
      moveRight,
      pressedActions: new Set(index === 0 ? pressed : []),
    })),
);

// Each step of the frame as a no-op, over a character on the field with nothing in reach. The walk's inputs are written
// Into the one state the frame reads, as the input does, and the features' own steps are left as no-ops, so the bench
// Measures the frame's own glue and the stores it reads, and not the steps a feature's bench measures
const createBenchFrameOptions = (): { options: WorldFrameOptions; setFrame: (index: number) => void } => {
  const inputState = createIdleInputState();
  let frameIndex = 0;
  const input: Input = {
    dispose: () => {},
    press: () => {},
    readInput: () => {
      Object.assign(inputState, WALK_INPUTS[frameIndex]);
      return inputState;
    },
    release: () => {},
    setTouchStick: () => {},
    turn: () => {},
  };
  return {
    options: {
      abyssChoices: ref<unknown>(),
      characterBody: new Object3D(),
      checkIsPaused: () => false,
      closeShortcutWheel: () => {},
      dispatchInteraction: () => {},
      domainClaimOffers: ref<unknown>(),
      drawDayOutcrops: () => {},
      elementalSight: { isOn: false, origin: { x: 0, z: 0 }, spreadSeconds: 0 },
      getEquippedGadgetCooldown: () => 0,
      getMemberMaxHealth: () => undefined,
      hudFrame: { gadgetCooldown: 0, pivotX: 0, pivotY: 0, seconds: 0, sheerCold: 0, stamina: 0 },
      input,
      inputState,
      interactionPrompts: ref({ interactables: [], selectedId: "", windowStart: 0 }),
      isHudHidden: ref(false),
      // Only the frame's random source and the team's effects are read, by the steps that are no-ops here and the switch
      kitContext: { kitEffectState: { effects: [] }, random: () => 0 } as unknown as KitContext,
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
    },
    setFrame: (index) => {
      frameIndex = index;
    },
  };
};

describe(useWorldFrame, () => {
  test("a walk of the world's frames", async ({ bench }) => {
    startTestWorldSession();
    const { options, setFrame } = createBenchFrameOptions();
    const { stepFrame } = useWorldFrame(options);
    // The world's clock runs on across iterations, so a switch's cooldown and the frame's time read as they do in play
    let elapsed = 0;
    // Forty iterations, each a few tens of milliseconds, so a run takes seconds and the report holds its own spread
    await bench("a walk of the world's frames", () => {
      for (let index = 0; index < WALK_INPUTS.length; index++) {
        setFrame(index);
        stepFrame({ delta: FRAME_SECONDS, elapsed });
        elapsed += FRAME_SECONDS;
      }
    }).run({ ...BENCHMARK_RUN_OPTIONS, iterations: 40, warmupIterations: 5 });
  });
});
