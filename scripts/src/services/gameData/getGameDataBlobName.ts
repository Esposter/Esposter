import { GAME_DATA_BLOB_PATH } from "genshin-world";

export const getGameDataBlobName = (hash: string): string => `${GAME_DATA_BLOB_PATH}/${hash}.json`;
