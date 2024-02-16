import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { OffsetPaginationData } from "@/models/shared/pagination/offset/OffsetPaginationData";
import { createOperations } from "@/services/shared/pagination/createOperations";
import { type AItemEntity } from "~/models/shared/AItemEntity";
import { type Entity } from "~/models/shared/Entity";
import { uncapitalize } from "~/util/text/uncapitalize";

export const createOffsetPaginationData = <
  TItem extends Pick<AItemEntity, "id"> & ItemMetadata,
  TEntity extends Entity[keyof Entity] & string,
>(
  entity: TEntity,
) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const offsetPaginationData = ref(new OffsetPaginationData<TItem>()) as Ref<OffsetPaginationData<TItem>>;
  const itemList = computed({
    get: () => offsetPaginationData.value.items,
    set: (items) => {
      offsetPaginationData.value.items = items;
    },
  });

  const hasMore = computed({
    get: () => offsetPaginationData.value.hasMore,
    set: (hasMore) => {
      offsetPaginationData.value.hasMore = hasMore;
    },
  });

  const initializeOffsetPaginationData = (data: OffsetPaginationData<TItem>) => {
    offsetPaginationData.value = data;
  };
  const resetOffsetPaginationData = () => {
    offsetPaginationData.value = new OffsetPaginationData<TItem>();
  };

  return {
    [`${uncapitalize(entity)}List`]: itemList,
    ...createOperations(itemList, entity),
    hasMore,
    initializeOffsetPaginationData,
    resetOffsetPaginationData,
  } as const;
};
