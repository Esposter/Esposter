import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { withFinalizerAsync } from "@esposter/shared";

export const useReadResources = (searchQuery: Ref<string>, types: Ref<ResourceType[]>) => {
  const { $trpc } = useNuxtApp();
  const items = ref<Resource[]>([]);
  const count = ref(0);
  const isLoading = ref(false);
  const readResources = async ({
    itemsPerPage,
    page,
    sortBy,
  }: {
    itemsPerPage: number;
    page: number;
    sortBy: SortItem<keyof Resource>[];
  }) => {
    const searchQueryValue = searchQuery.value || undefined;
    const typesValue = types.value.length > 0 ? types.value : undefined;
    isLoading.value = true;
    await withFinalizerAsync(
      async () => {
        const [newCount, { items: newItems }] = await Promise.all([
          $trpc.resource.count.query({ searchQuery: searchQueryValue, types: typesValue }),
          $trpc.resource.readResources.query({
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
            searchQuery: searchQueryValue,
            sortBy,
            types: typesValue,
          }),
        ]);
        count.value = newCount;
        items.value = newItems;
      },
      () => {
        isLoading.value = false;
      },
    );
  };
  return { count, isLoading, items, readResources };
};
