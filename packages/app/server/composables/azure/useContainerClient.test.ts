import type { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import type { ContainerClient } from "@azure/storage-blob";

import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const useContainerClientMock: typeof useContainerClient = (containerName) =>
  Promise.resolve(new MockContainerClient("", containerName) as unknown as ContainerClient);

describe.todo("useContainerClient");
