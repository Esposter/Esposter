import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { ContainerClient } from "@azure/storage-blob";

import { GameDataTargetBlobServiceUrlMap } from "#src/services/gameData/GameDataTargetBlobServiceUrlMap";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { AzureContainer } from "@esposter/db-schema";

// Keyless: the credential resolves to the owner's `az login` on each machine, so no account key sits on disk. Reads never
// Use it, since the container is public and every object is fetched anonymously
export const createGameDataContainerClient = (target: GameDataTarget): ContainerClient =>
  new BlobServiceClient(GameDataTargetBlobServiceUrlMap[target], new DefaultAzureCredential()).getContainerClient(
    AzureContainer.AppAssets,
  );
