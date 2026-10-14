import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { GameLanguage } from "genshin-text";

// The English names the fixtures' screens draw their things by, read once from the local game data for every fixture
export const englishNameText = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);
