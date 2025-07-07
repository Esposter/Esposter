import type { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import type { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import type { ContainerClient } from "@azure/storage-blob";

import { MockContainerClient } from "@@/server/models/azure/container/MockContainerClient";
import { describe } from "vitest";

export const MockContainerClientMap = new Map<AzureContainer, MockContainerClient>();

export const useContainerClientMock: typeof useContainerClient = (containerName) =>
  new Promise((resolve) => {
    const mockContainerClient = MockContainerClientMap.get(containerName);
    if (mockContainerClient) return resolve(mockContainerClient as unknown as ContainerClient);

    const newMockContainerClient = new MockContainerClient("", containerName);
    MockContainerClientMap.set(containerName, newMockContainerClient);
    return resolve(newMockContainerClient as unknown as ContainerClient);
  });

describe.todo("useContainerClient");
