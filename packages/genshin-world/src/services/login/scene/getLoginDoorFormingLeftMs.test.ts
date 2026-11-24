import type { LoginGlide } from "#src/models/login/LoginGlide";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LoginStage } from "#src/models/login/LoginStage";
import { LOGIN_DOOR_FORMING_LEAD_MS } from "#src/services/login/constants";
import { readLoginData } from "#src/services/login/readLoginData";
import { advanceLoginGlide } from "#src/services/login/scene/advanceLoginGlide";
import { LOGIN_DOOR_REST_DISTANCE, LOGIN_GLIDE_PREPARING_SPEED } from "#src/services/login/scene/constants";
import { getLoginDoorFormingLeftMs } from "#src/services/login/scene/getLoginDoorFormingLeftMs";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const { scroll } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);
// The door's distance ahead of the camera as the scene reads it: its rest short of the camera, plus what the glide
// Has left to carry it
const doorAheadOfCamera = ({ scrolled, stopAt = scrolled }: LoginGlide): number =>
  LOGIN_DOOR_REST_DISTANCE + stopAt - scrolled;

describe(getLoginDoorFormingLeftMs, () => {
  const walkwayRow = scroll.LoginScene_Bridge01_Vo;
  const deltaSeconds = 1 / 60;
  const run = (glide: LoginGlide, seconds: number): LoginGlide[] =>
    Array.from({ length: Math.round(seconds / deltaSeconds) }).reduce<LoginGlide[]>(
      (glides) => [...glides, advanceLoginGlide(walkwayRow, glides.at(-1) ?? glide, LoginStage.Door, deltaSeconds)],
      [],
    );

  test.each([
    ["the glide has the lead to fly", LOGIN_DOOR_FORMING_LEAD_MS * 2, LOGIN_DOOR_FORMING_LEAD_MS],
    ["the glide has less than the lead to fly", LOGIN_DOOR_FORMING_LEAD_MS / 2, LOGIN_DOOR_FORMING_LEAD_MS / 2],
    ["the door rises as the glide comes due", 0, 0],
  ])("reports the lead left when %s", (_label, dueGapMs, leftMs) => {
    expect.hasAssertions();

    // A glide due with `dueGapMs` of its pace left before the door rises, the walkway's copies stopping at two
    const speed = LOGIN_GLIDE_PREPARING_SPEED;
    const stop = walkwayRow.length * 2;
    const doorLead = LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_DOOR_REST_DISTANCE;
    const scrolled = stop - doorLead - (dueGapMs / 1000) * speed;
    const reported = run({ scrolled, speed }, 4)
      .map((glide) => getLoginDoorFormingLeftMs(doorAheadOfCamera(glide), glide.speed))
      .filter((formingLeftMs) => formingLeftMs !== undefined);

    expect(takeOne(reported, 0) / 1000).toBeCloseTo(leftMs / 1000, 1);
  });
});
