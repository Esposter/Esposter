import type { AzureContainer } from "@esposter/db-schema";

import { MockContainerDatabase } from "azure-mock";
import { describe } from "vitest";

export const readBlobNames = (containerName: AzureContainer): string[] => [
  ...(MockContainerDatabase.get(containerName)?.keys() ?? []),
];

describe.todo("readBlobNames");
