import { createKitState } from "#src/services/kit/createKitState";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { createParty } from "#src/services/party/createParty";
import { noop } from "@esposter/shared";
import {
  createCharacterController,
  createGroundQuery,
  createLandmarkCollider,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(stepActiveKit, () => {
  test("plays no action while the character on the field has no combatant", () => {
    expect.hasAssertions();

    const kitState = createKitState();

    stepActiveKit(
      kitState,
      {
        height: 0,
        isAttackHeld: false,
        isAttackPressed: true,
        isBurstPressed: false,
        isSkillHeld: false,
        isSkillPressed: false,
        locomotionState: LocomotionState.Run,
      },
      0.1,
      {
        aimYaw: 0,
        characterController: createCharacterController({
          ground: createGroundQuery(() => 0, -1),
          landmarkCollider: createLandmarkCollider(),
          position: new Vector3(),
          staminaMaximum: STAMINA_MAX,
        }),
        characterIdCombatantMap: new Map(),
        enemyMap: new Map(),
        enemyTables: { enemyKindMap: new Map(), enemyLevelCurves: {} },
        isAimHeld: false,
        kitEffectState: { effects: [] },
        landedHits: [],
        party: createParty([1]),
        random: () => 0,
        strikeOre: noop,
      },
    );

    expect(kitState).toStrictEqual(createKitState());
  });
});
