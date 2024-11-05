import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import type { VForm } from "vuetify/components";

import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";
import deepEqual from "fast-deep-equal";

export const createEditFormData = <TItem extends AItemEntity>(items: ComputedRef<TItem[]>) => {
  const router = useRouter();
  const editFormDialog = ref(false);
  const editFormRef = ref<InstanceType<typeof VForm>>();
  const editedItem = ref<TItem>();
  const editedIndex = ref(-1);
  const originalItem = computed(() => {
    const id = editedItem.value?.id;
    if (!id) return undefined;
    return items.value.find((i) => i.id === id) ?? undefined;
  });
  const isFullScreenDialog = ref(false);
  // The form is "valid" if there's no form open/no errors
  const isEditFormValid = computed(() => !editFormRef.value || editFormRef.value.errors.length === 0);
  const isSavable = computed(() => {
    if (!editedItem.value) return false;
    // For the form to be savable, it has to have no errors
    // and either it is a new item, or it is not equal to the original item
    else
      return (
        isEditFormValid.value &&
        // The edited item is a clone of original item which does not clone the class information
        // so it's not "strictly" equal including the Object prototype
        (!originalItem.value || !deepEqual(editedItem.value, structuredClone(toDeepRaw(originalItem.value))))
      );
  });
  // We know the form is dirty if:
  // 1. The user has pucked up and the edit form isn't valid
  // 2. or that it is savable
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (id: string) => {
    const item = items.value.find((item) => item.id === id);
    if (!item) return;

    editedItem.value = structuredClone(toDeepRaw(item));
    editedIndex.value = items.value.findIndex((item) => item.id === id);
    editFormDialog.value = true;
    await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
  };
  const resetItem = async () => {
    editedItem.value = undefined;
    editedIndex.value = -1;
    await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: undefined } });
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
