import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import {
  WILDLIFE_CHARGE_REACH,
  WILDLIFE_ESCAPE_RADIUS,
  WILDLIFE_ESCAPE_SECONDS,
  WILDLIFE_FLEE_SPEED,
  WILDLIFE_STEP_SECONDS,
} from "#src/services/wildlife/constants";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { stepWildlife } from "#src/services/wildlife/stepWildlife";
import { strikeWildlife } from "#src/services/wildlife/strikeWildlife";
import { describe, expect, test } from "vitest";

// An animal one metre north of the target, within the escape radius and facing south
const createNearWildlife = (): Wildlife =>
  createWildlife({ id: "animal", kind: WildlifeKind.Squirrel, position: { x: 0, z: 1 } });

describe(stepWildlife, () => {
  const STEP_SECONDS = 0.5;
  // Long enough for a boar to close its reach on the target at the charge speed, and then some
  const CHARGE_STEP_BOUND = 600;
  const TARGET = { x: 0, z: 0 };

  test("leaves an idle animal out of the target's reach where it stands", () => {
    expect.hasAssertions();

    const wildlife = createWildlife({
      id: "animal",
      kind: WildlifeKind.Squirrel,
      position: { x: 0, z: WILDLIFE_ESCAPE_RADIUS + 1 },
    });
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    expect(wildlife).toStrictEqual({
      heading: 0,
      home: { x: 0, z: WILDLIFE_ESCAPE_RADIUS + 1 },
      id: "animal",
      kind: WildlifeKind.Squirrel,
      position: { x: 0, z: WILDLIFE_ESCAPE_RADIUS + 1 },
      state: WildlifeState.Idle,
      stateSeconds: STEP_SECONDS,
    });
  });

  test("runs an idle animal in reach straight away from the target", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    expect(wildlife).toStrictEqual({
      heading: 0,
      home: { x: 0, z: 1 },
      id: "animal",
      kind: WildlifeKind.Squirrel,
      position: { x: 0, z: 1 + WILDLIFE_FLEE_SPEED * STEP_SECONDS },
      state: WildlifeState.Fleeing,
      stateSeconds: 0,
    });
  });

  test("keeps running on its last heading while the target is gone and its escape time has not passed", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    stepWildlife(wildlife, undefined, STEP_SECONDS);
    expect(wildlife.position).toStrictEqual({ x: 0, z: 1 + WILDLIFE_FLEE_SPEED * STEP_SECONDS * 2 });
  });

  test("goes idle once its escape time has passed with the target out of reach", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    stepWildlife(wildlife, undefined, WILDLIFE_ESCAPE_SECONDS);
    expect(wildlife.state).toBe(WildlifeState.Idle);
  });

  test("a struck animal does not flee", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    strikeWildlife(wildlife);
    stepWildlife(wildlife, TARGET, WILDLIFE_ESCAPE_SECONDS);
    expect(wildlife).toStrictEqual({
      heading: 0,
      home: { x: 0, z: 1 },
      id: "animal",
      kind: WildlifeKind.Squirrel,
      position: { x: 0, z: 1 },
      state: WildlifeState.Struck,
      stateSeconds: 0,
    });
  });

  test("runs for another escape time while the target is still in reach", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    stepWildlife(wildlife, TARGET, WILDLIFE_ESCAPE_SECONDS);
    expect(wildlife.state).toBe(WildlifeState.Fleeing);
    expect(wildlife.stateSeconds).toBe(0);
  });

  test("a boar charges a player standing in its way", () => {
    expect.hasAssertions();

    // A boar on the player's reach, charging straight at the player until it makes contact
    const wildlife = createWildlife({
      id: "boar",
      kind: WildlifeKind.Boar,
      position: { x: 0, z: WILDLIFE_CHARGE_REACH },
    });
    let isHit = false;
    for (let step = 0; step < CHARGE_STEP_BOUND && !isHit; step++)
      isHit = stepWildlife(wildlife, TARGET, WILDLIFE_STEP_SECONDS);

    expect(isHit).toBe(true);
    expect(wildlife.state).toBe(WildlifeState.Fleeing);
  });
});
