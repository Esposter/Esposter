import type { GameDataset } from "genshin-world";

// One key of a dataset a publish replaces on its own, leaving the dataset's other keys as the lock has them
export type GameDataKeyScope = `${GameDataset}/${string}`;
