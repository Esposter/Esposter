import { useItemStore } from "@/store/tableEditor/item";
import { VForm } from "vuetify/components";

export const useTableEditorStore = defineStore("tableEditor", () => {
  const itemStore = useItemStore();
  const { createItem, updateItem } = itemStore;
  const { editedItem } = storeToRefs(itemStore);
  const searchQuery = ref("");
  // @NOTE: Fix up this type once vuetify team exposes their types
  const editFormRef = ref<typeof VForm & { errors: { id: string; errorMessages: string[] }[] }>();
  const editFormDialog = ref(false);
  const editedIndex = ref(-1);
  const isFullScreenDialog = ref(false);
  const isEditFormValid = computed(() => editFormRef.value?.errors.length === 0);

  const save = () => {
    if (!editedItem.value) return;

    if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);

    resetEditor();
  };
  const resetEditor = () => {
    editedItem.value = null;
    editedIndex.value = -1;
  };

  return {
    searchQuery,
    editFormRef,
    editFormDialog,
    isFullScreenDialog,
    isEditFormValid,
    editedIndex,
    save,
    resetEditor,
  };
});
