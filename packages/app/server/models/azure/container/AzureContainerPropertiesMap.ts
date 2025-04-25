import type { ContainerCreateOptions } from "@azure/storage-blob";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const AzureContainerPropertiesMap: Partial<Record<AzureContainer, ContainerCreateOptions>> = {
  [AzureContainer.DungeonsAssets]: { access: "blob" },
  [AzureContainer.EsposterAssets]: { access: "blob" },
  [AzureContainer.PublicUserAssets]: { access: "blob" },
};
