import type { KitContext } from "#src/models/kit/KitContext";
import type { InputState } from "genshin-engine";

import WorldCharacter from "#src/components/World/Character/Index.vue";
import { BodyType } from "#src/models/character/BodyType";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { BodyTypeLocomotionMap } from "#src/services/world/locomotion/BodyTypeLocomotionMap";
import { sleep } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { createGrassTrail, createLandmarkCollider, createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { Object3D, Vector3 } from "three";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { defineComponent, h } from "vue";

// The party's kit with no combatant on the field, so its kit plays nothing and the body's move alone is read
const createFieldKitContext = (): KitContext => {
  const fieldKitContext: Partial<KitContext> = {
    characterIdCombatantMap: new Map(),
    kitEffectState: { effects: [] },
    locomotionState: LocomotionState.Idle,
    outbox: [],
    party: createParty([TRAVELER_CHARACTER_ID]),
    stamina: createStamina(STAMINA_MAX),
  };
  return fieldKitContext as KitContext;
};

// The character mounted in a canvas with a camera behind it, its body read back after the frames it steps through
const renderCharacter = async (isMoveHeld = false): Promise<Object3D> => {
  const body = new Object3D();
  const inputState: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 1,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
    zoomSteps: 0,
  };
  await render(
    defineComponent({
      setup: () => () =>
        h(
          TresCanvas,
          { windowSize: true },
          {
            default: () => [
              // Named as a tag, since @tresjs/core does not export the camera as a component the test can import
              h("TresPerspectiveCamera", { far: 2000, fov: 45, position: [0, 2, 0] }),
              h(WorldCharacter, {
                body,
                getGroundHeight: () => 0,
                grassTrail: createGrassTrail(),
                inputState,
                isHeld: false,
                isMoveHeld,
                isOrbiting: false,
                kitContext: createFieldKitContext(),
                landmarkCollider: createLandmarkCollider(),
                locomotion: BodyTypeLocomotionMap[BodyType.MediumFemale],
                origin: new Vector3(),
                waterLevel: -100,
              }),
            ],
          },
        ),
    }),
  );
  return body;
};

describe("worldCharacter", () => {
  const WALK_MS = 1000;

  test("holding Tab stops the character walking", async () => {
    expect.hasAssertions();

    const body = await renderCharacter(true);
    await sleep(WALK_MS);
    const start = body.position.clone();
    await sleep(WALK_MS);

    expect(body.position.distanceTo(start)).toBeLessThan(0.01);
  });

  // The control for the test above: the same move with no wheel open walks the body, so a still body is the wheel's doing
  test("walks under the same move while no wheel is open", async () => {
    expect.hasAssertions();

    const body = await renderCharacter();
    await sleep(WALK_MS);
    const start = body.position.clone();
    await sleep(WALK_MS);

    expect(body.position.distanceTo(start)).toBeGreaterThan(0.5);
  });
});
