import type { DevCommand } from "#src/models/dev/DevCommand";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Party } from "#src/models/party/Party";
import type { GameClock, WeatherKind } from "genshin-engine";
import type { Object3D } from "three";

import { PERCENT } from "#src/services/dev/constants";
import { formatDevClockTime } from "#src/services/dev/formatDevClockTime";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { z } from "zod";

// `state` answers where the character stands, its place, the hour, the weather, its health and its team's names as one
// Line of key=value, read from the world as it is now. A part whose scene is not mounted is left blank
export const createStateCommand = ({
  body,
  catalogue,
  getCharacterName,
  getGameClock,
  getWeather,
  party,
}: {
  body: Object3D;
  catalogue: Catalogue;
  getCharacterName: (characterId: number) => string;
  getGameClock: () => GameClock | undefined;
  getWeather: () => WeatherKind | undefined;
  party: Party;
}): DevCommand => ({
  args: z.object({}),
  name: "state",
  run: () => {
    const { position } = body;
    const place = findAreaAt(catalogue, position.x, position.z)?.name ?? "";
    const gameClock = getGameClock();
    const hour = gameClock ? formatDevClockTime(gameClock.minutes) : "";
    const weather = getWeather() ?? "";
    const characterIds = getDeployedCharacterIds(party);
    const activeCharacterId = characterIds[party.activeIndex];
    const health =
      activeCharacterId === undefined
        ? ""
        : `${Math.round(getPartyMember(party, activeCharacterId).healthShare * PERCENT)}%`;
    const names = characterIds.map((characterId) => getCharacterName(characterId));
    const coordinates = [position.x, position.y, position.z].map((value) => Math.round(value));
    return {
      ok: true,
      value: `position=${coordinates.join(",")} place=${place} hour=${hour} weather=${weather} health=${health} party=${names.join(",")}`,
    };
  },
});
