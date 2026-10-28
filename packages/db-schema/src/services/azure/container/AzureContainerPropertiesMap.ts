import type { ContainerCreateOptions } from "@azure/storage-blob";

import { AzureContainer } from "#src/models/azure/container/AzureContainer";

export const AzureContainerPropertiesMap: Partial<Record<AzureContainer, ContainerCreateOptions>> = {
  [AzureContainer.PublicAppAssets]: { access: "blob" },
  [AzureContainer.PublicDungeonsAssets]: { access: "blob" },
  [AzureContainer.PublicGenshinAssets]: { access: "blob" },
  [AzureContainer.PublicUserAssets]: { access: "blob" },
};
