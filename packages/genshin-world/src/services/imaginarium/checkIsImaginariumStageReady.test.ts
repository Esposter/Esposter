import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { checkIsImaginariumStageReady } from "#src/services/imaginarium/checkIsImaginariumStageReady";
import { IMAGINARIUM_PERFORMER_COUNT, IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";
import { describe, expect, test } from "vitest";

describe(checkIsImaginariumStageReady, () => {
  const member: ImaginariumMember = { isSpecialGuest: false, vigor: IMAGINARIUM_VIGOR };

  test("should be ready with four characters each holding Vigor", () => {
    expect.hasAssertions();

    expect(checkIsImaginariumStageReady(Array.from({ length: IMAGINARIUM_PERFORMER_COUNT }, () => member))).toBe(true);
  });

  test("should not be ready once one of the four is out of Vigor", () => {
    expect.hasAssertions();

    const spentMember: ImaginariumMember = { ...member, vigor: 0 };

    expect(checkIsImaginariumStageReady([member, member, member, spentMember])).toBe(false);
  });

  test("should not be ready with fewer characters than a stage takes", () => {
    expect.hasAssertions();

    expect(checkIsImaginariumStageReady([member, member, member])).toBe(false);
  });
});
