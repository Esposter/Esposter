import type { GameDataLock } from "genshin-world";

import { renderConstant } from "#src/services/gameData/renderConstant";

// The nested constants the lock's keys render as, with each key's type the leaf of its path. A dataset's keys are
// `GameDataKeyOf<"shops">`, so a consumer narrows to one dataset without restating the strings
export const getGameDataKeysSource = (lock: GameDataLock): string =>
  [
    "// The hosted game data's keys as the lock names them, nested by the segments of each path.",
    "// Code names a key by its segments, never by its path or its hash. Generated from gameDataLock.json on every publish.",
    renderConstant("GameDataKeys", Object.keys(lock.objects)),
    "",
    renderConstant("GameDataIndexKeys", Object.keys(lock.indexes)),
    "",
    "export type GameDataIndexKey = LeafKeys<typeof GameDataIndexKeys>;",
    "export type GameDataKey = LeafKeys<typeof GameDataKeys>;",
    "export type GameDataKeyOf<D extends keyof typeof GameDataKeys> = LeafKeys<(typeof GameDataKeys)[D]>;",
    "",
    "// The keys a nested constant names, which are its leaves",
    "type LeafKeys<T> = T extends string ? T : { [K in keyof T]: LeafKeys<T[K]> }[keyof T];",
    "",
  ].join("\n");
