import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { toGcsimArea } from "#src/services/genshinAssets/kits/gcsim/toGcsimArea";
import { SKILL_TARGETING_AREA } from "genshin-world";
import { describe, expect, test } from "vitest";

const targetCircle = (hitbox: Partial<GcsimHitbox>): GcsimHitbox => ({
  center: GcsimHitboxCenter.PrimaryTarget,
  line: 1,
  name: "Q",
  radius: 7.5,
  shape: GcsimHitboxShape.Circle,
  ...hitbox,
});

describe(toGcsimArea, () => {
  test("prices a circle on the target with a forward offset as its radius from the targeting zone's edge, the offset included", () => {
    expect.hasAssertions();

    expect(toGcsimArea(targetCircle({ offset: [0, 1] }), SKILL_TARGETING_AREA)).toStrictEqual({
      area: { angle: 2 * Math.PI, height: 2, radius: SKILL_TARGETING_AREA.radius + 1 + 7.5 },
      cause: KitProvisionalCause.TargetCentred,
    });
  });

  test("prices a circle on the target with no offset as before, from the targeting zone's edge", () => {
    expect.hasAssertions();

    expect(toGcsimArea(targetCircle({}), SKILL_TARGETING_AREA)).toStrictEqual({
      area: { angle: 2 * Math.PI, height: 2, radius: SKILL_TARGETING_AREA.radius + 7.5 },
      cause: KitProvisionalCause.TargetCentred,
    });
  });
});
