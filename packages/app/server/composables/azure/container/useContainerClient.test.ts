import type { AzureContainer } from "@esposter/db-schema";
import type { ContainerClient } from "@azure/storage-blob";

import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const useContainerClient = (azureContainer: AzureContainer): Promise<ContainerClient> =>
  Promise.resolve(new MockContainerClient("", azureContainer) as unknown as ContainerClient);

describe.todo("useContainerClient");
