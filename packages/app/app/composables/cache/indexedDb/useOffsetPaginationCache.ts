import type { IndexedDbDatabaseSchema } from "@/models/cache/indexedDb/IndexedDbDatabaseSchema";
import type { IndexedDbStoreConfiguration } from "@/models/cache/indexedDb/IndexedDbStoreConfiguration";
import type { IndexedDbStoreName } from "@/models/cache/indexedDb/IndexedDbStoreName";
import type { IndexKey, IndexNames } from "idb";
import type { Promisable } from "type-fest";

import { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { getResultAsync, noop } from "@esposter/shared";

interface OffsetPaginationCacheOptions<
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TSourceItem,
> {
  configuration: IndexedDbStoreConfiguration<TStore, TIndex>;
  getWriteItems?: (items: TSourceItem[]) => IndexedDbDatabaseSchema[TStore]["value"][];
  initializeOffsetPaginationData: (data: OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>) => void;
  items: MaybeRefOrGetter<TSourceItem[]>;
  onHydrate?: (items: IndexedDbDatabaseSchema[TStore]["value"][]) => Promisable<void>;
  partitionKey: MaybeRefOrGetter<"" | IndexKey<IndexedDbDatabaseSchema, TStore, TIndex> | undefined>;
}

export const useOffsetPaginationCache = <
  TStore extends IndexedDbStoreName,
  TIndex extends IndexNames<IndexedDbDatabaseSchema, TStore>,
  TSourceItem extends IndexedDbDatabaseSchema[TStore]["value"] = IndexedDbDatabaseSchema[TStore]["value"],
>({
  configuration,
  getWriteItems,
  initializeOffsetPaginationData,
  items,
  onHydrate,
  partitionKey,
}: OffsetPaginationCacheOptions<TStore, TIndex, TSourceItem>) => {
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(
    () => toValue(items),
    (newItems) => {
      const partitionKeyValue = toValue(partitionKey);
      if (!partitionKeyValue || newItems.length === 0) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        await writeIndexedDb(configuration, getWriteItems?.(newItems) ?? newItems, partitionKeyValue);
      }).match(noop, console.error);
    },
  );

  watch(
    () => toValue(partitionKey),
    (newPartitionKey) => {
      if (!newPartitionKey || online.value) return;
      const previousOperation = pendingOperation;
      pendingOperation = getResultAsync(async () => {
        await previousOperation;
        const cachedItems = await readIndexedDb(configuration, newPartitionKey);
        if (toValue(partitionKey) !== newPartitionKey || cachedItems.length === 0) return;

        const cachedData = new OffsetPaginationData<IndexedDbDatabaseSchema[TStore]["value"]>();
        cachedData.items = cachedItems;
        initializeOffsetPaginationData(cachedData);
        await onHydrate?.(cachedItems);
      }).match(noop, console.error);
    },
  );

  const flush = () => pendingOperation;
  return { flush };
};
