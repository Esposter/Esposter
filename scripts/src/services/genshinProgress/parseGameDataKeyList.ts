import type { GenshinLockKeys } from "#src/models/genshinProgress/GenshinLockKeys";

// The bodies of the two key constants `gameDataKeys.ts` renders from the lock, each closing on its own `} as const;` line.
// A key is the quoted path a leaf takes after its colon, never a quoted property name such as `"nod-krai": {`
const OBJECT_KEYS_REGEX = /export const GameDataKeys = (?<body>[\s\S]*?)\n\} as const;/u;
const INDEX_KEYS_REGEX = /export const GameDataIndexKeys = (?<body>[\s\S]*?)\n\} as const;/u;
const KEY_REGEX = /: "(?<key>[^"]+)"/gu;

const readLeaves = (text: string, regex: RegExp): string[] =>
  Array.from((text.match(regex)?.groups?.body ?? "").matchAll(KEY_REGEX), ({ groups }) => groups?.key ?? "");

// The keys the world's key list names, the datasets read whole and the indexes read by id
export const parseGameDataKeyList = (text: string): GenshinLockKeys => ({
  indexes: readLeaves(text, INDEX_KEYS_REGEX),
  objects: readLeaves(text, OBJECT_KEYS_REGEX),
});
