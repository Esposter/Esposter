import type { IItem } from "@/models/tableEditor/IItem";
import { useItemStore } from "@/store/tableEditor/item";
import equal from "deep-equal";
import { VForm } from "vuetify/components";

export const useTableEditorStore = defineStore("tableEditor", () => {
  const router = useRouter();
  const itemStore = useItemStore();
  const { createItem, updateItem } = itemStore;
  const { itemList } = storeToRefs(itemStore);
  const searchQuery = ref("");
  // @NOTE: Fix up this type once vuetify team exposes their types
  const editFormRef = ref<typeof VForm & { errors: { id: string; errorMessages: string[] }[] }>();
  const editFormDialog = ref(false);
  const editedItem = ref<IItem | null>(null);
  const editedIndex = ref(-1);
  const isFullScreenDialog = ref(false);
  const isEditFormValid = computed(() => editFormRef.value?.errors.length === 0);
  const isSavable = computed(() => {
    const originalItem = itemList.value.find((item) => item.id === editedItem.value?.id);
    if (!originalItem) return true;
    return isEditFormValid.value && !equal(editedItem.value, originalItem);
  });

  const editItem = (id: string) => {
    const item = itemList.value.find((item) => item.id === id);
    if (!item) return;

    editedItem.value = structuredClone(toRaw(item));
    editedIndex.value = itemList.value.findIndex((item) => item.id === id);
    router.push({ ...router.currentRoute.value, query: { itemId: item.id } });
    editFormDialog.value = true;
  };
  const save = () => {
    if (!editedItem.value) return;

    if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);

    editFormDialog.value = false;
  };
  const resetItem = () => {
    editedItem.value = null;
    editedIndex.value = -1;
  };

  return {
    searchQuery,
    editFormRef,
    editFormDialog,
    editedItem,
    editedIndex,
    isFullScreenDialog,
    isEditFormValid,
    isSavable,
    editItem,
    save,
    resetItem,
  };
});
