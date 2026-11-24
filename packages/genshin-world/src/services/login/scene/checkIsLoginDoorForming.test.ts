import type { LoginGlide } from "#src/models/login/LoginGlide";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LoginStage } from "#src/models/login/LoginStage";
import { readLoginData } from "#src/services/login/readLoginData";
import { advanceLoginGlide } from "#src/services/login/scene/advanceLoginGlide";
import { checkIsLoginDoorForming } from "#src/services/login/scene/checkIsLoginDoorForming";
import {
  LOGIN_DOOR_FORMING_LEAD_MS,
  LOGIN_DOOR_REST_DISTANCE,
  LOGIN_GLIDE_PREPARING_SPEED,
} from "#src/services/login/scene/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";
import { describe, expect, test } from "vitest";

const { scroll } = await readLoginData(GAME_DATA_LOCAL_BASE_URL);
// The door's distance ahead of the camera as the scene reads it: its rest short of the camera, plus what the glide
// Has left to carry it
const doorAheadOfCamera = ({ scrolled, stopAt = scrolled }: LoginGlide): number =>
  LOGIN_DOOR_REST_DISTANCE + stopAt - scrolled;

describe(checkIsLoginDoorForming, () => {
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
  ])("starts the forming ahead of the rise when %s", (_label, dueGapMs, leadMs) => {
    expect.hasAssertions();

    // A glide due with `dueGapMs` of its pace left before the door rises, the walkway's copies stopping at two
    const speed = LOGIN_GLIDE_PREPARING_SPEED;
    const stop = walkwayRow.length * 2;
    const doorLead = LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_DOOR_REST_DISTANCE;
    const scrolled = stop - doorLead - (dueGapMs / 1000) * speed;
    const glides = run({ scrolled, speed }, 4);
    const forming = glides.findIndex((glide) => checkIsLoginDoorForming(doorAheadOfCamera(glide), glide.speed));
    const rise = glides.findIndex((glide) => doorAheadOfCamera(glide) <= LOGIN_WALKWAY_SUNK_DISTANCE);

    expect((rise - forming) * deltaSeconds).toBeCloseTo(leadMs / 1000, 1);
  });
});
