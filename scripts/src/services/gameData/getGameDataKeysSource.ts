import type { GameDataLock } from "genshin-world";

import { compareNaturally } from "#src/services/shared/compareNaturally";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A node of the nested constant: a key's segment names either the next node or the key itself
interface KeyTree {
  [segment: string]: KeyTree | string;
}

const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/u;

// The node a segment leads to, made if it is not there yet.
// A key that also prefixes other keys moves under `self`, since one node cannot be both a string and a branch.
const descend = (node: KeyTree, segment: string): KeyTree => {
  const entry = node[segment];
  if (entry !== undefined && typeof entry !== "string") return entry;
  const child: KeyTree = typeof entry === "string" ? { self: entry } : {};
  node[segment] = child;
  return child;
};

const insertKey = (tree: KeyTree, key: string): void => {
  const segments = key.split("/");
  const leaf = segments.pop() ?? key;
  const parent = segments.reduce((node, segment) => descend(node, segment), tree);
  const entry = parent[leaf];
  if (entry === undefined) parent[leaf] = key;
  else if (typeof entry === "string")
    throw new InvalidOperationError(Operation.Push, key, "is listed twice in the lock");
  else entry.self = key;
};

const renderName = (name: string): string => (IDENTIFIER_REGEX.test(name) ? name : JSON.stringify(name));

const renderTree = (tree: KeyTree, indentation: string): string =>
  Object.entries(tree)
    .toSorted(([left], [right]) => compareNaturally(left, right))
    .map(([name, value]) =>
      typeof value === "string"
        ? `${indentation}${renderName(name)}: ${JSON.stringify(value)},`
        : `${indentation}${renderName(name)}: {\n${renderTree(value, `${indentation}  `)}\n${indentation}},`,
    )
    .join("\n");

const renderConstant = (name: string, keys: string[]): string => {
  const tree: KeyTree = {};
  for (const key of keys) insertKey(tree, key);
  return `export const ${name} = {\n${renderTree(tree, "  ")}\n} as const;`;
};

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
