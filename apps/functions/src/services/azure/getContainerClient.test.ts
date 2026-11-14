import type { ContainerClient } from "@azure/storage-blob";
import type { StorageBucket } from "@esposter/db-schema";

import { MockContainerClient } from "azure-mock";
import { describe } from "vitest";

export const getContainerClient = (storageBucket: StorageBucket): Promise<ContainerClient> =>
  Promise.resolve(new MockContainerClient("", storageBucket) as unknown as ContainerClient);

describe.todo("getContainerClient");
