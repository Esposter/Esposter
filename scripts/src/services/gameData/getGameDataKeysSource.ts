import type { GameDataLock } from "genshin-world";

import { GAME_DATA_INDEX_KEYS_NAME, GAME_DATA_KEYS_NAME } from "#src/services/gameData/constants";
import { renderConstant } from "#src/services/gameData/renderConstant";

// The nested constants the lock's keys render as, with each key's type the leaf of its path. A dataset's keys are
// `GameDataKeyOf<"shops">`, so a consumer narrows to one dataset without restating the strings
export const getGameDataKeysSource = (lock: GameDataLock): string =>
  [
    "// The lock's keys as a nested constant, each path nested by its segments.",
    "// GameDataKey is the union of its leaf paths, which readers may use to name a key.",
    "// Generated from gameDataLock.json on every publish.",
    renderConstant(GAME_DATA_KEYS_NAME, Object.keys(lock.objects)),
    "",
    renderConstant(GAME_DATA_INDEX_KEYS_NAME, Object.keys(lock.indexes)),
    "",
    `export type GameDataIndexKey = LeafKeys<typeof ${GAME_DATA_INDEX_KEYS_NAME}>;`,
    `export type GameDataKey = LeafKeys<typeof ${GAME_DATA_KEYS_NAME}>;`,
    `export type GameDataKeyOf<D extends keyof typeof ${GAME_DATA_KEYS_NAME}> = LeafKeys<(typeof ${GAME_DATA_KEYS_NAME})[D]>;`,
    "",
    "// The keys a nested constant names, which are its leaves",
    "type LeafKeys<T> = T extends string ? T : { [K in keyof T]: LeafKeys<T[K]> }[keyof T];",
    "",
  ].join("\n");
