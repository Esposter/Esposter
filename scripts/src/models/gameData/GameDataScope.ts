import type { GameDataKeyScope } from "#src/models/gameData/GameDataKeyScope";
import type { GameDataset } from "genshin-world";

// What a publish replaces in the lock: a whole dataset, every key under it, or a single key
export type GameDataScope = GameDataKeyScope | GameDataset;
