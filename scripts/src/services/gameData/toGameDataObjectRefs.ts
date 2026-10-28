import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";

// A lock's map as the objects it names: each key is the dataset its object is stored under
export const toGameDataObjectRefs = (hashMap: Record<string, string>): GameDataObjectRef[] =>
  Object.entries(hashMap).map(([dataset, hash]) => ({ dataset, hash }));
