import type { AItemEntity } from "@/models/shared/entity/AItemEntity";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";
import deepEqual from "deep-equal";
import type { UnwrapRef } from "vue";
import type { VForm } from "vuetify/components";

export const createEditFormData = <TItem extends AItemEntity>(items: ComputedRef<TItem[]>) => {
  const router = useRouter();
  const editFormDialog = ref(false);
  const editFormRef = ref<InstanceType<typeof VForm>>();
  const editedItem = ref<TItem | null>(null);
  const editedIndex = ref(-1);
  const originalItem = computed(() => {
    const id = editedItem.value?.id;
    if (!id) return null;
    return items.value.find((i) => i.id === id) ?? null;
  });
  const isFullScreenDialog = ref(false);
  // The form is "valid" if there's no form open/no errors
  const isEditFormValid = computed(() => !editFormRef.value || editFormRef.value.errors.length === 0);
  // For the form to be savable, it has to have no errors
  // and either it is a new item, or it is not equal to the original item
  const isSavable = computed(() => {
    if (!editedItem.value) return false;
    else return isEditFormValid.value && (!originalItem.value || !deepEqual(editedItem.value, originalItem.value));
  });
  // We know the form is dirty if:
  // 1. The user has pucked up and the edit form isn't valid
  // 2. or that it is savable
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (id: string) => {
    const item = items.value.find((item) => item.id === id);
    if (!item) return;

    // @TODO: Vue cannot unwrap generic refs yet
    editedItem.value = structuredClone(toDeepRaw(item)) as UnwrapRef<TItem>;
    editedIndex.value = items.value.findIndex((item) => item.id === id);
    editFormDialog.value = true;
    await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
  };
  const resetItem = async () => {
    editedItem.value = null;
    editedIndex.value = -1;
    await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: undefined } });
  };

  return {
    editFormRef,
    editFormDialog,
    editedItem,
    editedIndex,
    originalItem,
    isFullScreenDialog,
    isEditFormValid,
    isSavable,
    isDirty,
    editItem,
    resetItem,
  };
};
