import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { getKitHitFieldNames } from "#src/services/genshinAssets/kits/record/getKitHitFieldNames";
import { describe, expect, test } from "vitest";

describe(getKitHitFieldNames, () => {
  test("names each single hit in hitFields once, from the candidate paths and the overlay's", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "hitFields.lunarBloom.poiseDamage": { cause: KitProvisionalCause.Unsourced, value: 80 },
      "hitFields.meowball.gauge": { cause: KitProvisionalCause.Unsourced, value: 1 },
    };

    expect(
      getKitHitFieldNames(
        new Map([
          ["hitFields.meowball.poiseDamage", []],
          ["skill.hits.0.poiseDamage", []],
        ]),
        overlay,
      ),
    ).toStrictEqual(["meowball", "lunarBloom"]);
  });
});
