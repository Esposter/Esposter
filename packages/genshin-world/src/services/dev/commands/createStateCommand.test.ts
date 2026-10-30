import { createStateCommand } from "#src/services/dev/commands/createStateCommand";
import { DEV_CATALOGUE } from "#src/services/dev/constants.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { WeatherKind } from "genshin-engine";
import { Object3D } from "three";
import { describe, expect, test } from "vitest";

const getCharacterName = (characterId: number) => (characterId === 1 ? "Amber" : "Kaeya");

describe(createStateCommand, () => {
  test("answers the position, place, hour, weather, health and party as one record", () => {
    expect.hasAssertions();

    const body = new Object3D();
    body.position.set(12.4, 3.6, -7.2);
    const party = createParty([1, 2]);
    getPartyMember(party, 1).healthShare = 0.85;
    const result = createStateCommand({
      body,
      catalogue: DEV_CATALOGUE,
      getCharacterName,
      getGameClock: () => ({ minutes: 1260, minutesPerSecond: 0 }),
      getWeather: () => WeatherKind.Clear,
      party,
    }).run({});

    expect(result).toStrictEqual({
      ok: true,
      value: "position=12,4,-7 place=Windrise hour=21:00 weather=Clear health=85% party=Amber,Kaeya",
    });
  });

  test("leaves the hour and weather blank while the world's scene is not mounted", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    const result = createStateCommand({
      body: new Object3D(),
      catalogue: DEV_CATALOGUE,
      getCharacterName,
      getGameClock: () => undefined,
      getWeather: () => undefined,
      party,
    }).run({});

    expect(result).toStrictEqual({
      ok: true,
      value: "position=0,0,0 place=Windrise hour= weather= health=100% party=Amber,Kaeya",
    });
  });
});
