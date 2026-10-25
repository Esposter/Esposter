import type { ContainerClient } from "@azure/storage-blob";
import type { AzureContainer } from "@esposter/db-schema";

import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const createContainerClient = (containerName: AzureContainer): ContainerClient =>
  new MockContainerClient("", containerName) as unknown as ContainerClient;

describe.todo("createContainerClient");
