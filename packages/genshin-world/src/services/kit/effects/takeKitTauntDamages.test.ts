import { KitEventKind } from "#src/models/kit/KitEventKind";
import { createKitTaunt } from "#src/services/kit/effects/createKitTaunt.test";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { takeKitTauntDamages } from "#src/services/kit/effects/takeKitTauntDamages";
import { describe, expect, test } from "vitest";

describe(takeKitTauntDamages, () => {
  test("sends each strike a taunt took since the last step once, as the damage it dealt", () => {
    expect.hasAssertions();
    const taunt = createKitTaunt(100, 5);
    damageKitTaunt(taunt, 30);
    damageKitTaunt(taunt, 150);

    expect(takeKitTauntDamages([taunt])).toStrictEqual([
      { damage: 30, kind: KitEventKind.TauntDamaged, taunt },
      { damage: 150, kind: KitEventKind.TauntDamaged, taunt },
    ]);
    expect(takeKitTauntDamages([taunt])).toStrictEqual([]);
  });
});
