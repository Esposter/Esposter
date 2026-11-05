import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";
import type { GameDataTarget } from "#src/models/shared/GameDataTarget";
import type { ContainerClient } from "@azure/storage-blob";
import type { GameDataLock } from "genshin-world";

export interface PublishGameDataOptions {
  // The lock as the working tree has it, which the publication replaces the scopes of
  currentLock: GameDataLock;
  // Creates the accounts to publish to, absent for a dry run, which reads and writes no account and needs no credential.
  // It is called only once a publication stores an object or drops a lock entry, so an empty publication that leaves the
  // Lock as it is creates no account and no credential
  getContainerClientMap?: () => Record<GameDataTarget, ContainerClient>;
  publication: GameDataPublication;
  // The datasets whose entries the publication replaces wholesale, or the single keys it replaces, and no other entry of
  // The lock is touched
  scopes: GameDataScope[];
}
