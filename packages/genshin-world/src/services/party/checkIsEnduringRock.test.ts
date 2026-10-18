import type { Moondrift } from "#src/models/party/Moondrift";

import { Element } from "#src/models/Element";
import { checkIsEnduringRock } from "#src/services/party/checkIsEnduringRock";
import { MOONDRIFT_NEARBY_RADIUS } from "#src/services/party/constants";
import { describe, expect, test } from "vitest";

describe(checkIsEnduringRock, () => {
  test("a Moondrift formed nearby gives a shield's defence", () => {
    expect.hasAssertions();

    const combatant = { elementalResonances: [Element.Geo] };
    const position = { x: 0, z: 0 };
    const nearMoondrift: Moondrift = { position: { x: MOONDRIFT_NEARBY_RADIUS - 1, z: 0 }, secondsRemaining: 9 };
    const farMoondrift: Moondrift = { position: { x: MOONDRIFT_NEARBY_RADIUS + 1, z: 0 }, secondsRemaining: 9 };

    expect([
      checkIsEnduringRock(combatant, [], [farMoondrift], position),
      checkIsEnduringRock(combatant, [], [farMoondrift, nearMoondrift], position),
    ]).toStrictEqual([false, true]);
  });
});
