import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { ToData } from "@esposter/shared";
import type { VForm } from "vuetify/components";

import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { toRawDeep } from "@esposter/shared";
import deepEqual from "fast-deep-equal";

export const createEditFormData = <TItem extends ToData<AEntity>, TIdKeys extends EntityIdKeys<TItem>>(
  items: ComputedRef<TItem[]>,
  idKeys: [...TIdKeys],
) => {
  const router = useRouter();
  const editFormDialog = ref(false);
  const editFormRef = ref<InstanceType<typeof VForm>>();
  const editedItem = ref<TItem>();
  const editedIndex = ref(-1);
  const originalItem = computed(() => {
    const editedItemValue = editedItem.value;
    return editedItemValue
      ? items.value.find((i) => getIsEntityIdEqualComparator(idKeys, editedItemValue)(i))
      : undefined;
  });
  const isFullScreenDialog = ref(false);
  // The form is "valid" if there's no form open/no errors
  const isEditFormValid = computed(() => !editFormRef.value || editFormRef.value.errors.length === 0);
  const isSavable = computed(
    () =>
      // For the form to be savable, it has to:
      Boolean(editedItem.value) &&
      // 1. Have no errors
      isEditFormValid.value &&
      // 2. Be a new item or be not equal to the original item
      // The edited item is a clone of original item which does not clone the class information
      // so it's not "strictly" equal but deepEqual is not a strict check so it's ok
      (!originalItem.value || !deepEqual(editedItem.value, structuredClone(toRawDeep(originalItem.value)))),
  );
  // We know the form is dirty if:
  // 1. The user has pucked up and the edit form isn't valid
  // 2. or that it is savable
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    const isEntityIdEqualComparator = getIsEntityIdEqualComparator(Object.keys(ids) as [...TIdKeys], ids);
    const item = items.value.find((i) => isEntityIdEqualComparator(i));
    if (!item) return;

    editedItem.value = structuredClone(toRawDeep(item));
    editedIndex.value = items.value.findIndex((i) => isEntityIdEqualComparator(i));
    editFormDialog.value = true;
    await router.replace({ query: { ...router.currentRoute.value.query, ...ids } });
  };
  const resetItem = async () => {
    editedItem.value = undefined;
    editedIndex.value = -1;
    await router.replace({
      query: { ...router.currentRoute.value.query, ...Object.fromEntries(idKeys.map((key) => [key, undefined])) },
    });
  };

  return {
    editedIndex,
    editedItem,
    editFormDialog,
    editFormRef,
    editItem,
    isDirty,
    isEditFormValid,
    isFullScreenDialog,
    isSavable,
    originalItem,
    resetItem,
  };
};
