import type { OfferingProgress } from "#src/models/offering/OfferingProgress";
import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { LEVELS, OCULUS_ITEM_ID } from "#src/services/statue/constants.test";
import { offerStatueOculi } from "#src/services/statue/offerStatueOculi";
import { describe, expect, test } from "vitest";

describe(offerStatueOculi, () => {
  test("an offer reaches each level the Oculi held complete", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 1, levels: LEVELS };

    expect(offerStatueOculi(progress)).toStrictEqual({ heldCounts: {}, level: 2, levels: LEVELS });
  });

  test("an offer with no Oculi held reaches no level", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: {}, level: 1, levels: LEVELS };

    expect(offerStatueOculi(progress)).toStrictEqual(progress);
  });

  test("an offer to a region not yet started reaches no level", () => {
    expect.hasAssertions();
    const progress: OfferingProgress<StatueLevel> = { heldCounts: { [OCULUS_ITEM_ID]: 1 }, level: 0, levels: LEVELS };

    expect(offerStatueOculi(progress)).toStrictEqual(progress);
  });
});
