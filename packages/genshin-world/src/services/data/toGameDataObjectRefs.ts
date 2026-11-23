import type { GameDataObjectRef } from "#src/models/data/GameDataObjectRef";
import type { HostedAssetObject } from "hosted-assets";

// A lock's map as the objects it names: each key is the dataset its object is stored under
export const toGameDataObjectRefs = (objectMap: Record<string, HostedAssetObject>): GameDataObjectRef[] =>
  Object.entries(objectMap).map(([dataset, { sha256 }]) => ({ dataset, hash: sha256 }));
