import type { KitContext } from "#src/models/kit/KitContext";
import type { WorldFrameOptions } from "#src/models/world/WorldFrameOptions";
import type { Input } from "genshin-engine";

import { createParty } from "#src/services/party/createParty";
import { createIdleInputState } from "genshin-engine";
import { Object3D } from "three";
import { describe } from "vitest";
import { ref } from "vue";

// Each step of the frame as a no-op, over a character on the field with nothing in reach and an input holding nothing, so
// A test overrides only the step it watches
export const createFrameOptions = (overrides: Partial<WorldFrameOptions> = {}): WorldFrameOptions => {
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
    ...overrides,
  };
};

describe.todo("createFrameOptions");
