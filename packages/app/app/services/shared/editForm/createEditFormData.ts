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
  const editForm = ref<InstanceType<typeof VForm>>();
  const editedItem = ref<TItem>();
  const editedIndex = ref(-1);
  const originalItem = computed(() => {
    const editedItemValue = editedItem.value;
    return editedItemValue
      ? items.value.find((i) => getIsEntityIdEqualComparator(idKeys as (keyof TItem & string)[], editedItemValue)(i))
      : undefined;
  });
  const isFullScreenDialog = ref(false);
  const isEditFormValid = computed(() => !editForm.value || editForm.value.errors.length === 0);
  const isSavable = computed(
    () =>
      // For the form to be savable, it has to:
      Boolean(editedItem.value) &&
      // 1. Have no errors
      isEditFormValid.value &&
      // 2. Be a new item, or differ from the original.
      // The edited item is a clone that drops class information, so it's never strictly equal;
      // deepEqual isn't a strict check, so it's fine.
      (!originalItem.value || !deepEqual(editedItem.value, structuredClone(toRawDeep(originalItem.value)))),
  );
  // The form is dirty if:
  // 1. The user has interacted and the edit form isn't valid.
  // 2. Or it is savable.
  const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

  const editItem = async (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    const isEntityIdEqualComparator = getIsEntityIdEqualComparator(
      Object.keys(ids) as (keyof TItem & string)[],
      ids as Partial<TItem>,
    );
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
