import type { AzureMetadataEntity } from "@/models/shared/metadata/AzureMetadataEntity";
import type { AzureMetadataOperationDataKey } from "@/models/shared/metadata/AzureMetadataOperationDataKey";

import { AzureMetadataOperation } from "@/models/shared/metadata/AzureMetadataOperation";
import { getOrCreate, uncapitalize } from "@esposter/shared";

// Both accessors name the partition, never whichever one is on screen: a read response, a subscription echo and an
// Optimistic rollback all land after an await, and filing them by the partition current at that moment puts one
// Room's metadata under another's
export const createAzureMetadataMap = <TType extends string>(azureEntityTypeKey: TType) => {
  // Map<partitionKey, Map<rowKey, T[]>>
  const metadataMap: Ref<Map<string, Map<string, AzureMetadataEntity<TType>[]>>> = ref(new Map());
  const getMetadatas = (partitionKey: string, rowKey: string) => {
    const dataMap = metadataMap.value.get(partitionKey);
    if (dataMap) return getOrCreate(dataMap, rowKey, () => []);
    else return [];
  };
  const setMetadatas = (partitionKey: string, rowKey: string, metadatas: AzureMetadataEntity<TType>[]) => {
    getOrCreate(metadataMap.value, partitionKey, () => new Map<string, AzureMetadataEntity<TType>[]>()).set(
      rowKey,
      metadatas,
    );
  };
  return {
    [`${uncapitalize(AzureMetadataOperation.Get)}${azureEntityTypeKey}s`]: getMetadatas,
    [`${uncapitalize(AzureMetadataOperation.Set)}${azureEntityTypeKey}s`]: setMetadatas,
  } as {
    [P in AzureMetadataOperationDataKey<TType>]: P extends `${Uncapitalize<AzureMetadataOperation.Get>}${TType}s`
      ? typeof getMetadatas
      : P extends `${Uncapitalize<AzureMetadataOperation.Set>}${TType}s`
        ? typeof setMetadatas
        : never;
  };
};
