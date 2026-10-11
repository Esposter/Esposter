import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createKitTaunt } from "#src/services/kit/effects/createKitTaunt.test";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { describe, expect, test } from "vitest";

describe(damageKitTaunt, () => {
  test("takes each strike's damage from the taunt's health, never below none, and raises each strike once", () => {
    expect.hasAssertions();
    const outbox: KitEvent[] = [];
    const taunt = createKitTaunt(100, 5);
    damageKitTaunt(outbox, taunt, 30);
    damageKitTaunt(outbox, taunt, 150);

    expect({ health: taunt.health, outbox }).toStrictEqual({
      health: 0,
      outbox: [
        { damage: 30, kind: KitEventKind.TauntDamaged, taunt },
        { damage: 150, kind: KitEventKind.TauntDamaged, taunt },
      ],
    });
  });
});
