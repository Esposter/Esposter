import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "@/models/entity/EntityIdKeys";
import type { ToData } from "@esposter/shared";
import type { VForm } from "vuetify/components";

import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { toRawDeep } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

export const createEditFormData = <TItem extends ToData<AEntity>, TIdKeys extends EntityIdKeys<TItem>>(
  items: ComputedRef<TItem[]>,
  idKeys: [...TIdKeys],
) => {
  const router = useRouter();
  const editFormDialog = ref(false);
  const editForm = ref<InstanceType<typeof VForm>>();
  const editedItem = ref<TItem>();
  const originalItem = computed(() => {
    const editedItemValue = editedItem.value;
    return editedItemValue
      ? items.value.find((item) =>
          getEntityIdEqualComparator(idKeys as (keyof TItem & string)[], editedItemValue)(item),
        )
      : undefined;
  });
  const isFullScreenDialog = ref(false);
  const isEditFormValid = computed(() => !editForm.value || editForm.value.errors.length === 0);
  const isSavable = computed(
    () =>
      Boolean(editedItem.value) &&
      isEditFormValid.value &&
      // The edited item is a clone that drops class information, so it is never strictly equal —
      // `deepEqual` is what makes the comparison against the original mean anything
      (!originalItem.value || !deepEqual(editedItem.value, structuredClone(toRawDeep(originalItem.value)))),
  );
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    const checkIsEntityIdEqual = getEntityIdEqualComparator(
      Object.keys(ids) as (keyof TItem & string)[],
      ids as Partial<TItem>,
    );
    const item = items.value.find((currentItem) => checkIsEntityIdEqual(currentItem));
    if (!item) return;

    editedItem.value = structuredClone(toRawDeep(item));
    editFormDialog.value = true;
    await router.replace({ query: { ...router.currentRoute.value.query, ...ids } });
  };
  const resetItem = async () => {
    editedItem.value = undefined;
    await router.replace({
      query: { ...router.currentRoute.value.query, ...Object.fromEntries(idKeys.map((key) => [key, undefined])) },
    });
  };
  // Restores the edit dialog from the id query params (e.g. on refresh/deep-link) once items are loaded
  watchImmediate(items, async () => {
    if (editFormDialog.value || editedItem.value) return;
    const queryIdEntries = idKeys.flatMap((key) => {
      const value = router.currentRoute.value.query[key as string];
      return typeof value === "string" ? [[key, value] as const] : [];
    });
    if (queryIdEntries.length !== idKeys.length) return;
    await editItem(Object.fromEntries(queryIdEntries) as { [P in keyof TItem & TIdKeys[number]]: TItem[P] });
  });

  return {
    editedItem,
    editForm,
    editFormDialog,
    editItem,
    isDirty,
    isEditFormValid,
    isFullScreenDialog,
    isSavable,
    originalItem,
    resetItem,
  };
};
