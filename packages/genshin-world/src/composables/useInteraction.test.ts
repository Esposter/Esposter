import type { Interactable } from "#src/models/interaction/Interactable";
import type { InputState } from "genshin-engine";

import { useInteraction } from "#src/composables/useInteraction";
import { INTERACTION_HELD_REPEAT_SECONDS } from "#src/services/interaction/constants";
import { InputAction } from "genshin-engine";
import { InteractionKind } from "genshin-interface";
import { Object3D } from "three";
import { describe, expect, test } from "vitest";

describe(useInteraction, () => {
  const drop: Interactable = {
    id: "drop",
    kind: InteractionKind.PickUp,
    name: "Damaged Mask",
    position: { x: 1, y: 0, z: 0 },
  };
  const resident: Interactable = {
    id: "talk",
    kind: InteractionKind.Talk,
    name: "Amber",
    position: { x: 0, y: 0, z: 1 },
  };
  const idleInput: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
    zoomSteps: 0,
  };

  test("a press returns the selected row", () => {
    expect.hasAssertions();

    const { readInteraction } = useInteraction(() => [drop], new Object3D());

    expect(readInteraction({ ...idleInput, pressedActions: new Set([InputAction.Interact]) }, 0)).toStrictEqual(drop);
  });

  test("a held F picks up again each repeat interval", () => {
    expect.hasAssertions();

    const { readInteraction } = useInteraction(() => [drop], new Object3D());
    const heldInput = { ...idleInput, heldActions: new Set([InputAction.Interact]) };

    expect(readInteraction(heldInput, INTERACTION_HELD_REPEAT_SECONDS - 0.05)).toBeUndefined();
    expect(readInteraction(heldInput, INTERACTION_HELD_REPEAT_SECONDS - 0.05)).toStrictEqual(drop);
  });

  test("the wheel steps the rows while more than one shows, and its notches are spent", () => {
    expect.hasAssertions();

    const { interactionPrompts, readInteraction } = useInteraction(() => [drop, resident], new Object3D());
    const wheelInput = { ...idleInput, zoomSteps: 1 };
    readInteraction(wheelInput, 0);

    expect({ selectedId: interactionPrompts.value.selectedId, zoomSteps: wheelInput.zoomSteps }).toStrictEqual({
      selectedId: resident.id,
      zoomSteps: 0,
    });
  });

  test("a row renamed in place is handed on", () => {
    expect.hasAssertions();

    let interactables = [drop];
    const { interactionPrompts, readInteraction } = useInteraction(() => interactables, new Object3D());
    readInteraction(idleInput, 0);
    interactables = [{ ...drop, name: "Slime Condensate" }];
    readInteraction(idleInput, 0);

    expect(interactionPrompts.value.interactables[0]?.name).toBe("Slime Condensate");
  });

  test("the wheel is left to the camera with one row", () => {
    expect.hasAssertions();

    const { readInteraction } = useInteraction(() => [drop], new Object3D());
    const wheelInput = { ...idleInput, zoomSteps: 1 };
    readInteraction(wheelInput, 0);

    expect(wheelInput.zoomSteps).toBe(1);
  });
});
