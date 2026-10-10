import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

export interface PublishGameDataOptions {
  // The accounts to publish to, absent for a dry run, which reads and writes no account and needs no credential
  containerClientMap?: Record<GameDataTarget, ContainerClient>;
  // The lock as the working tree has it, which the publication replaces the scopes of
  currentLock: GameDataLock;
  publication: GameDataPublication;
  // The datasets whose entries the publication replaces wholesale, or the single keys it replaces, and no other entry of
  // The lock is touched
  scopes: GameDataScope[];
}
