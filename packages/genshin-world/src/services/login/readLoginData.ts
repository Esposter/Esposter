import type { LoginData } from "#src/models/login/LoginData";

import { loginAgeRatingSchema } from "#src/models/login/LoginAgeRating";
import { loginCloudLayerTexturesSchema } from "#src/models/login/LoginCloudLayerTextures";
import { loginCloudsDataSchema } from "#src/models/login/LoginCloudsData";
import { loginDoorSchema } from "#src/models/login/LoginDoor";
import { loginHullsSchema } from "#src/models/login/LoginHulls";
import { loginInterfaceClipsSchema } from "#src/models/login/LoginInterfaceClips";
import { loginInterfaceRectsSchema } from "#src/models/login/LoginInterfaceRects";
import { loginMusicSchema } from "#src/models/login/LoginMusic";
import { loginPavingDataSchema } from "#src/models/login/LoginPavingData";
import { loginScrollSchema } from "#src/models/login/LoginScroll";
import { loginSkySchema } from "#src/models/login/LoginSky";
import { loginSoundsSchema } from "#src/models/login/LoginSounds";
import { loginStoneSchema } from "#src/models/login/LoginStone";
import { loginStoneLightSchema } from "#src/models/login/LoginStoneLight";
import { loginTowersSchema } from "#src/models/login/LoginTowers";
import { loginWalkwaySchema } from "#src/models/login/LoginWalkway";
import { readGameData } from "#src/services/data/readGameData";

// The login's records as the login's fits, its parity loops and the authored age rating publish them
// Each fetched by its key from the hosted game data and checked against its schema as it arrives
export const readLoginData = async (gameDataBaseUrl: string): Promise<LoginData> => {
  const [
    ageRating,
    cloudLayerTextures,
    clouds,
    door,
    hulls,
    interfaceClips,
    interfaceRects,
    music,
    paving,
    scroll,
    sky,
    sounds,
    stone,
    stoneLight,
    towers,
    walkway,
  ] = await Promise.all([
    readGameData(gameDataBaseUrl, "login/ageRating", loginAgeRatingSchema),
    readGameData(gameDataBaseUrl, "login/cloudLayerTextures", loginCloudLayerTexturesSchema),
    readGameData(gameDataBaseUrl, "login/clouds", loginCloudsDataSchema),
    readGameData(gameDataBaseUrl, "login/door", loginDoorSchema),
    readGameData(gameDataBaseUrl, "login/hulls", loginHullsSchema),
    readGameData(gameDataBaseUrl, "login/interfaceClips", loginInterfaceClipsSchema),
    readGameData(gameDataBaseUrl, "login/interfaceRects", loginInterfaceRectsSchema),
    readGameData(gameDataBaseUrl, "login/music", loginMusicSchema),
    readGameData(gameDataBaseUrl, "login/paving", loginPavingDataSchema),
    readGameData(gameDataBaseUrl, "login/scroll", loginScrollSchema),
    readGameData(gameDataBaseUrl, "login/sky", loginSkySchema),
    readGameData(gameDataBaseUrl, "login/sounds", loginSoundsSchema),
    readGameData(gameDataBaseUrl, "login/stone", loginStoneSchema),
    readGameData(gameDataBaseUrl, "login/stoneLight", loginStoneLightSchema),
    readGameData(gameDataBaseUrl, "login/towers", loginTowersSchema),
    readGameData(gameDataBaseUrl, "login/walkway", loginWalkwaySchema),
  ]);
  return {
    ageRating,
    cloudLayerTextures,
    clouds,
    door,
    hulls,
    interfaceClips,
    interfaceRects,
    music,
    paving,
    scroll,
    sky,
    sounds,
    stone,
    stoneLight,
    towers,
    walkway,
  };
};
