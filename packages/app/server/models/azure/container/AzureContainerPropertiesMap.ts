import type { ContainerCreateOptions } from "@azure/storage-blob";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";

export const AzureContainerPropertiesMap: Partial<Record<AzureContainer, ContainerCreateOptions>> = {
  [AzureContainer.AppAssets]: { access: "blob" },
  [AzureContainer.DungeonsAssets]: { access: "blob" },
  [AzureContainer.PublicUserAssets]: { access: "blob" },
};
