import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { ToData } from "#shared/models/entity/ToData";
import type { VForm } from "vuetify/components";

import { getEntityIdComparator } from "#shared/services/entity/getEntityIdComparator";
import { toRawDeep } from "@/util/reactivity/toRawDeep";
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
    if (!editedItemValue) return null;
    return items.value.find(getEntityIdComparator(idKeys, editedItemValue)) ?? undefined;
  });
  const isFullScreenDialog = ref(false);
  // The form is "valid" if there's no form open/no errors
  const isEditFormValid = computed(() => !editFormRef.value || editFormRef.value.errors.length === 0);
  const isSavable = computed(
    () =>
      // For the form to be savable, it has to have no errors
      // and either it is a new item, or it is not equal to the original item
      Boolean(editedItem.value) &&
      isEditFormValid.value &&
      // The edited item is a clone of original item which does not clone the class information
      // so it's not "strictly" equal including the Object prototype
      (!originalItem.value || !deepEqual(editedItem.value, structuredClone(toRawDeep(originalItem.value)))),
  );
  // We know the form is dirty if:
  // 1. The user has pucked up and the edit form isn't valid
  // 2. or that it is savable
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    const entityIdComparator = getEntityIdComparator(Object.keys(ids) as [...TIdKeys], ids);
    const item = items.value.find(entityIdComparator);
    if (!item) return;

    editedItem.value = structuredClone(toRawDeep(item));
    editedIndex.value = items.value.findIndex(entityIdComparator);
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
