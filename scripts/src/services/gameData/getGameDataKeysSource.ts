import type { GameDataLock } from "genshin-world";

import { GAME_DATA_INDEX_KEYS_NAME, GAME_DATA_KEYS_NAME } from "#src/services/gameData/constants";
import { renderConstant } from "#src/services/gameData/renderConstant";

// The nested constants the lock's keys render as, with each key's type the leaf of its path. A dataset's keys are
// `GameDataKeyOf<"shops">`, so a consumer narrows to one dataset without restating the strings
export const getGameDataKeysSource = (lock: GameDataLock): string =>
  [
    "/* eslint-disable no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */",
    'import type { ValueOfDeep } from "type-fest";',
    "",
    "// The lock's keys as a nested constant, each path nested by its segments.",
    "// GameDataKey is the union of its leaf paths, which readers may use to name a key.",
    "// Generated from gameDataLock.json on every publish.",
    renderConstant(GAME_DATA_KEYS_NAME, Object.keys(lock.objects)),
    "",
    renderConstant(GAME_DATA_INDEX_KEYS_NAME, Object.keys(lock.indexes)),
    "",
    `export type GameDataIndexKey = ValueOfDeep<typeof ${GAME_DATA_INDEX_KEYS_NAME}>;`,
    `export type GameDataKey = ValueOfDeep<typeof ${GAME_DATA_KEYS_NAME}>;`,
    `export type GameDataKeyOf<D extends keyof typeof ${GAME_DATA_KEYS_NAME}> = ValueOfDeep<(typeof ${GAME_DATA_KEYS_NAME})[D]>;`,
    "",
  ].join("\n");
