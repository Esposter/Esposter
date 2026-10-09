import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock, GameDataset } from "genshin-world";

export interface PublishGameDataOptions {
  // The accounts to publish to, absent for a dry run, which reads and writes no account and needs no credential
  containerClientMap?: Record<GameDataTarget, ContainerClient>;
  // The lock as the working tree has it, which the publication replaces the scopes of
  currentLock: GameDataLock;
  publication: GameDataPublication;
  // The datasets whose entries the publication replaces wholesale, and no other entry of the lock is touched
  scopes: GameDataset[];
}
