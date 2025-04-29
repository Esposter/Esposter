import type { MessageMetadataEntityMap } from "#shared/models/db/message/metadata/MessageMetadataEntityMap";
import type { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import type { AzureMetadataOperationDataKey } from "@/models/shared/metadata/AzureMetadataOperationDataKey";
import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { AzureMetadataOperation } from "@/models/shared/metadata/AzureMetadataOperation";
import { uncapitalize } from "@/util/text/uncapitalize";

type TEntity<TType extends string> = TType extends MessageMetadataType ? MessageMetadataEntityMap[TType] : never;

export const createAzureMetadataMap = <TType extends string>(
  currentId: ReadonlyRefOrGetter<string | undefined>,
  azureEntityTypeKey: TType,
) => {
  // Map<partitionKey, Map<rowKey, T[]>>
  const metadataMap: Ref<Map<string, Map<string, TEntity<TType>[]>>> = ref(new Map());
  const getMetadatas = (rowKey: string) => {
    const currentIdValue = toValue(currentId);
    if (!currentIdValue) return [];
    const dataMap = metadataMap.value.get(currentIdValue);
    if (!dataMap) return [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dataMap.get(rowKey) ?? dataMap.set(rowKey, []).get(rowKey)!;
  };
  const setMetadatas = (rowKey: string, metadatas: TEntity<TType>[]) => {
    const currentIdValue = toValue(currentId);
    if (!currentIdValue) return [];
    const newMap = metadataMap.value.get(currentIdValue) ?? new Map<string, TEntity<TType>[]>();
    newMap.set(rowKey, metadatas);
    metadataMap.value.set(currentIdValue, newMap);
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
