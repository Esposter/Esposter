import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { EntityIdKeys } from "#src/models/entity/EntityIdKeys";
import type { EntityIds } from "#src/models/entity/EntityIds";
import type { ToData } from "@esposter/shared";

import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { checkIsDeepEqual, toRawDeep } from "@esposter/shared";

// `onEdit` hears every open of an item, a press, a menu's Edit and a restore from the query params alike, so a caller that
// Keeps a selection of its own writes it in one place
export const createEditFormData = <
  TItem extends ToData<AItemEntity>,
  // The id keys are also keys of TItem, which EntityIdKeys alone does not say for a generic TItem, since it stays a deferred conditional
  TIdKeys extends EntityIdKeys<TItem> & (keyof TItem & string)[],
>(
  items: ComputedRef<TItem[]>,
  idKeys: [...TIdKeys],
  onEdit?: (ids: EntityIds<TItem, TIdKeys>) => void,
) => {
  const router = useRouter();
  const isEditFormDialogOpen = ref(false);
  const editedItem = ref<TItem>();
  const originalItem = computed(() => {
    const editedItemValue = editedItem.value;
    if (!editedItemValue) return undefined;

    const checkIsOriginalItem = getEntityIdEqualComparator<TItem, TIdKeys[number]>(idKeys, editedItemValue);
    return items.value.find((item) => checkIsOriginalItem(item));
  });
  // Written by the edit dialog's form, which counts every field's rules as the reader types
  const isEditFormValid = ref(true);
  const isSavable = computed(
    () =>
      Boolean(editedItem.value) &&
      isEditFormValid.value &&
      // The edited item is a clone that drops class information, so it is never strictly equal —
      // `checkIsDeepEqual` is what makes the comparison against the original mean anything
      (!originalItem.value || !checkIsDeepEqual(editedItem.value, structuredClone(toRawDeep(originalItem.value)))),
  );
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (ids: EntityIds<TItem, TIdKeys>) => {
    const checkIsEntityIdEqual = getEntityIdEqualComparator<TItem, TIdKeys[number]>(idKeys, ids);
    const item = items.value.find((candidateItem) => checkIsEntityIdEqual(candidateItem));
    if (!item) return;

    onEdit?.(ids);
    editedItem.value = structuredClone(toRawDeep(item));
    isEditFormDialogOpen.value = true;
    await router.replace({ query: { ...router.currentRoute.value.query, ...ids } });
  };
  const resetItem = async () => {
    isEditFormDialogOpen.value = false;
    editedItem.value = undefined;
    await router.replace({
      query: { ...router.currentRoute.value.query, ...Object.fromEntries(idKeys.map((key) => [key, undefined])) },
    });
  };
  // Restores the edit dialog from the id query params (e.g. on refresh/deep-link) once items are loaded
  watchImmediate(items, async () => {
    if (isEditFormDialogOpen.value || editedItem.value) return;
    const queryIdEntries = idKeys.flatMap((key) => {
      const value = router.currentRoute.value.query[key];
      return typeof value === "string" ? [[key, value] as const] : [];
    });
    if (queryIdEntries.length !== idKeys.length) return;
    // Object.fromEntries types its keys as string, but the entries are the id keys read off the query, which are the
    // EntityIds' keys
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the values are the id strings the URL carried, and the compiler cannot relate a record built from the id keys to EntityIds of a generic TItem
    await editItem(Object.fromEntries(queryIdEntries) as EntityIds<TItem, TIdKeys>);
  });

  return { editedItem, editItem, isDirty, isEditFormDialogOpen, isEditFormValid, isSavable, originalItem, resetItem };
};
