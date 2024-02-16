import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";
import { createCrud } from "@/services/shared/pagination/createCrud";
import { type AItemEntity } from "~/models/shared/AItemEntity";
import { type Entity } from "~/models/shared/Entity";
import { uncapitalize } from "~/util/text/uncapitalize";

export const createCursorPaginationData = <
  TItem extends Pick<AItemEntity, "id"> & ItemMetadata,
  TEntity extends Entity,
>(
  entity: TEntity,
) => {
  // @TODO: Vue cannot unwrap generic refs yet
  const cursorPaginationData = ref(new CursorPaginationData<TItem>()) as Ref<CursorPaginationData<TItem>>;
  const itemList = computed({
    get: () => cursorPaginationData.value.items,
    set: (items) => {
      cursorPaginationData.value.items = items;
    },
  });
  const pushItemList = (items: TItem[]) => {
    itemList.value.push(...items);
  };

  const nextCursor = computed({
    get: () => cursorPaginationData.value.nextCursor,
    set: (nextCursor) => {
      cursorPaginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => cursorPaginationData.value.hasMore,
    set: (hasMore) => {
      cursorPaginationData.value.hasMore = hasMore;
    },
  });

  const initializeCursorPaginationData = (data: CursorPaginationData<TItem>) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
  };
  return {
    [`${uncapitalize(entity)}List`]: itemList,
    [`push${entity}List`]: pushItemList,
    ...createCrud(itemList, entity),
    nextCursor,
    hasMore,
    initializeCursorPaginationData,
    resetCursorPaginationData,
  };
};
