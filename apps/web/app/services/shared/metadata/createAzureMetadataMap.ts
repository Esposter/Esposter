import type { AzureMetadataEntity } from "@/models/shared/metadata/AzureMetadataEntity";
import type { AzureMetadataOperationDataKey } from "@/models/shared/metadata/AzureMetadataOperationDataKey";

import { AzureMetadataOperation } from "@/models/shared/metadata/AzureMetadataOperation";
import { getOrCreate, uncapitalize } from "@esposter/shared";

export const createAzureMetadataMap = <TType extends string>(
  currentId: MaybeRefOrGetter<string>,
  azureEntityTypeKey: TType,
) => {
  // Map<partitionKey, Map<rowKey, T[]>>
  const metadataMap: Ref<Map<string, Map<string, AzureMetadataEntity<TType>[]>>> = ref(new Map());
  const getMetadatas = (rowKey: string) => {
    const currentIdValue = toValue(currentId);
    if (!currentIdValue) return [];
    const dataMap = metadataMap.value.get(currentIdValue);
    if (dataMap) return getOrCreate(dataMap, rowKey, () => []);
    else return [];
  };
  const setMetadatas = (rowKey: string, metadatas: AzureMetadataEntity<TType>[]) => {
    const currentIdValue = toValue(currentId);
    if (!currentIdValue) return;
    getOrCreate(metadataMap.value, currentIdValue, () => new Map<string, AzureMetadataEntity<TType>[]>()).set(
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
