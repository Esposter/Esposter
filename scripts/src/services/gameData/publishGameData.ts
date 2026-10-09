import type { GameDataPublishResult } from "#src/models/gameData/GameDataPublishResult";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { PublishGameDataOptions } from "#src/models/gameData/PublishGameDataOptions";
import type { ContainerClient } from "@azure/storage-blob";

import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { formatGameDataLock } from "#src/services/gameData/formatGameDataLock";
import { mergeGameDataLock } from "#src/services/gameData/mergeGameDataLock";
import { planGameDataPublication } from "#src/services/gameData/planGameDataPublication";
import { publishGameDataToTarget } from "#src/services/gameData/publishGameDataToTarget";
import { readGameDataReachableHashes } from "#src/services/gameData/readGameDataReachableHashes";
import { compressJson } from "@esposter/db";
import { DEFAULT_COMPRESSION_LEVEL, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Stores what a publication names in every account and returns the lock it would commit. The caller writes that lock
// Only once this resolves: a failure in either account throws before then, so the committed lock never names data a
// Reader cannot fetch, and a rerun converges on the same objects.
export const publishGameData = async ({
  containerClientMap,
  currentLock,
  publication,
  scopes,
}: PublishGameDataOptions): Promise<GameDataPublishResult> => {
  const plan = planGameDataPublication(publication);
  const plannedKeys = [...Object.keys(plan.lock.objects), ...Object.keys(plan.lock.indexes)];
  const outsideScopeKey = plannedKeys.find((key) => !scopes.some((scope) => scope === takeOne(key.split("/"))));
  if (outsideScopeKey !== undefined)
    throw new InvalidOperationError(Operation.Update, outsideScopeKey, "is published outside the scopes it names");
  const nextLock = mergeGameDataLock(currentLock, scopes, plan.lock);
  if (formatGameDataLock(nextLock) === formatGameDataLock(currentLock))
    return { isUnchanged: true, nextLock: currentLock, storedObjectCount: 0 };
  // A dry run stops before any account, so it needs no credential and writes nothing
  if (!containerClientMap) return { isUnchanged: false, nextLock, storedObjectCount: plan.records.length };
  const compressedJsonMap = new Map<string, Promise<Buffer>>();
  // Compressed once per object and shared by both accounts, which hold the same bytes
  const getCompressedJson = (record: GameDataRecord) => {
    const compressedJson = compressedJsonMap.get(record.hash) ?? compressJson(record.json, DEFAULT_COMPRESSION_LEVEL);
    compressedJsonMap.set(record.hash, compressedJson);
    return compressedJson;
  };
  const publishAccount = async (containerClient: ContainerClient) => {
    const reachableHashes = await readGameDataReachableHashes(containerClient, [currentLock]);
    return publishGameDataToTarget(containerClient, plan.records, reachableHashes, getCompressedJson);
  };
  const [devCount, prodCount] = await Promise.all([
    publishAccount(containerClientMap[GameDataTarget.Dev]),
    publishAccount(containerClientMap[GameDataTarget.Prod]),
  ]);
  return {
    isUnchanged: false,
    nextLock,
    storedObjectCount: plan.records.length,
    uploadedCountMap: { [GameDataTarget.Dev]: devCount, [GameDataTarget.Prod]: prodCount },
  };
};
