import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { SelectedItemDataKey } from "@/models/shared/SelectedItemDataKey";

export const createSelectedItemData = <
  TItem extends Pick<AItemEntity, "id">,
  TEntityTypeKey extends EntityTypeKey = "Item",
>(
  itemList: Ref<TItem[]>,
  entityTypeKey: TEntityTypeKey = "Item" as TEntityTypeKey,
) => {
  const selectedItemIndex = ref(-1);
  const selectedItem = computed({
    get: () => itemList.value[selectedItemIndex.value],
    set: (newSelectedItem) => {
      if (!isItemSelected.value) return;
      itemList.value[selectedItemIndex.value] = newSelectedItem;
    },
  });
  const isItemSelected = computed(() => selectedItemIndex.value > -1);
  const unselectItem = () => {
    selectedItemIndex.value = -1;
  };
  return {
    [`selected${entityTypeKey}Index`]: selectedItemIndex,
    [`selected${entityTypeKey}`]: selectedItem,
    [`is${entityTypeKey}Selected`]: isItemSelected,
    [`unselect${entityTypeKey}`]: unselectItem,
  } as {
    [P in SelectedItemDataKey<TEntityTypeKey>]: P extends `selected${TEntityTypeKey}Index`
      ? typeof selectedItemIndex
      : P extends `selected${TEntityTypeKey}`
        ? typeof selectedItem
        : P extends `is${TEntityTypeKey}Selected`
          ? typeof isItemSelected
          : P extends `unselect${TEntityTypeKey}`
            ? typeof unselectItem
            : never;
  };
};
