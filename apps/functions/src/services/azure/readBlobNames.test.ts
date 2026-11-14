import type { StorageBucket } from "@esposter/db-schema";

import { MockContainerDatabase } from "azure-mock";
import { describe } from "vitest";

export const readBlobNames = (containerName: StorageBucket): string[] => [
  ...(MockContainerDatabase.get(containerName)?.keys() ?? []),
];

describe.todo("readBlobNames");
