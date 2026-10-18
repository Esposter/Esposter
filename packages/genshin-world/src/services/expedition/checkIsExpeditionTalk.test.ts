import type { Resident } from "#src/models/world/Resident";

import { describe, expect, test } from "vitest";

import { checkIsExpeditionTalk } from "#src/services/expedition/checkIsExpeditionTalk";
import { KATHERYNE_NPC_ID } from "#src/services/expedition/constants";

const KATHERYNE_TALK_ID = "6151202";
const BLANCHE_TALK_ID = "40165";

const residents: Resident[] = [
  { areaId: "starfell-valley", id: KATHERYNE_NPC_ID, nameTextId: "3398505741", talkId: KATHERYNE_TALK_ID },
  { areaId: "starfell-valley", id: "1423", nameTextId: "127025653", talkId: BLANCHE_TALK_ID },
];

describe(checkIsExpeditionTalk, () => {
  test("talking to Katheryne opens the expedition screen", () => {
    expect.hasAssertions();
    expect(checkIsExpeditionTalk(KATHERYNE_TALK_ID, residents)).toBe(true);
    expect(checkIsExpeditionTalk(BLANCHE_TALK_ID, residents)).toBe(false);
  });

  test("a talk is not Katheryne's before she stands in the world", () => {
    expect.hasAssertions();
    expect(checkIsExpeditionTalk(KATHERYNE_TALK_ID, residents.slice(1))).toBe(false);
  });
});
