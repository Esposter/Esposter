import type { ContainerClient } from "@azure/storage-blob";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const useContainerClientMock: typeof useContainerClient = (containerName) =>
  Promise.resolve(new MockContainerClient("", containerName) as unknown as ContainerClient);

describe.todo(useContainerClient);
