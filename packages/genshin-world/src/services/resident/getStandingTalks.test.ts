import type { Talk } from "#src/models/dialogue/Talk";
import type { Resident } from "#src/models/world/Resident";

import { TALK } from "#src/services/dialogue/constants.test";
import { getStandingTalks } from "#src/services/resident/getStandingTalks";
import { describe, expect, test } from "vitest";

describe(getStandingTalks, () => {
  // A fixture resident whose duel names game 12, and one with no duel, both beginning the sample talk
  const DUELLING_RESIDENT: Resident = { areaId: "area", duelGameId: 12, id: "1", nameTextId: "name", talkId: TALK.id };
  const UNDUELLING_RESIDENT: Resident = { areaId: "area", id: "2", nameTextId: "name", talkId: TALK.id };
  const STANDING_TALK_MAP: ReadonlyMap<string, Talk> = new Map([[TALK.id, TALK]]);

  test("holds the talk written for a resident whose duel names a game", () => {
    expect.hasAssertions();

    expect(getStandingTalks([DUELLING_RESIDENT], STANDING_TALK_MAP)).toStrictEqual([TALK]);
  });

  test("holds no talk for a resident whose duel names no game", () => {
    expect.hasAssertions();

    expect(getStandingTalks([UNDUELLING_RESIDENT], STANDING_TALK_MAP)).toStrictEqual([]);
  });

  test("holds no talk for a duelling resident with no talk written for it", () => {
    expect.hasAssertions();

    expect(getStandingTalks([DUELLING_RESIDENT], new Map<string, Talk>())).toStrictEqual([]);
  });
});
