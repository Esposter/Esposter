import type { Resident } from "#src/models/world/Resident";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { getTalkScreenKind } from "#src/services/dialogue/getTalkScreenKind";
import { describe, expect, test } from "vitest";

describe(getTalkScreenKind, () => {
  const TALK_ID = "talkId";
  const KEEPER: Resident = {
    areaId: "areaId",
    id: "id",
    keepsReputation: true,
    nameTextId: "nameTextId",
    talkId: TALK_ID,
  };

  test("talking to Mondstadt's keeper opens its Reputation screen", () => {
    expect.hasAssertions();

    expect(getTalkScreenKind(TALK_ID, [KEEPER])).toStrictEqual(ScreenKind.Reputation);
  });

  test("the Reputation screen is not reached before the keeper stands", () => {
    expect.hasAssertions();

    expect(getTalkScreenKind(TALK_ID, [])).toStrictEqual(ScreenKind.Dialogue);
  });
});
