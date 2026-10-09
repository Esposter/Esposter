import type { Wildlife } from "#src/models/wildlife/Wildlife";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import { WILDLIFE_ESCAPE_RADIUS, WILDLIFE_ESCAPE_SECONDS, WILDLIFE_FLEE_SPEED } from "#src/services/wildlife/constants";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { stepWildlife } from "#src/services/wildlife/stepWildlife";
import { describe, expect, test } from "vitest";

// An animal one metre north of the target, within the escape radius and facing south
const createNearWildlife = (): Wildlife =>
  createWildlife({ id: "animal", kind: WildlifeKind.Squirrel, position: { x: 0, z: 1 } });

describe(stepWildlife, () => {
  const STEP_SECONDS = 0.5;
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

  test("goes idle once its escape time has passed with the target out of reach", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    stepWildlife(wildlife, undefined, WILDLIFE_ESCAPE_SECONDS);
    expect(wildlife.state).toBe(WildlifeState.Idle);
  });

  test("runs for another escape time while the target is still in reach", () => {
    expect.hasAssertions();

    const wildlife = createNearWildlife();
    stepWildlife(wildlife, TARGET, STEP_SECONDS);
    stepWildlife(wildlife, TARGET, WILDLIFE_ESCAPE_SECONDS);
    expect(wildlife.state).toBe(WildlifeState.Fleeing);
    expect(wildlife.stateSeconds).toBe(0);
  });
});
