import type { ContainerCreateOptions } from "@azure/storage-blob";

import { AzureContainer } from "@/models/azure/container/AzureContainer";

export const AzureContainerPropertiesMap: Partial<Record<AzureContainer, ContainerCreateOptions>> = {
  [AzureContainer.AppAssets]: { access: "blob" },
  [AzureContainer.DungeonsAssets]: { access: "blob" },
  [AzureContainer.PublicUserAssets]: { access: "blob" },
};
