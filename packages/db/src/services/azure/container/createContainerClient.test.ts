import type { ContainerClient } from "@azure/storage-blob";
import type { StorageBucket } from "@esposter/db-schema";

import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const createContainerClient = (containerName: StorageBucket): ContainerClient =>
  new MockContainerClient("", containerName) as unknown as ContainerClient;

describe.todo("createContainerClient");
