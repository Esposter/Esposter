import type { IItem } from "@/models/tableEditor/IItem";
import type { TableEditor } from "@/models/tableEditor/TableEditor";
import { TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import equal from "deep-equal";
import { VForm } from "vuetify/components";

export const useTableEditorStore = defineStore("tableEditor", () => {
  const { $client } = useNuxtApp();
  const { status } = useSession();
  const router = useRouter();
  const itemStore = useItemStore();
  const { createItem, updateItem } = itemStore;

  const tableEditor = ref<TableEditor | null>(null);
  const searchQuery = ref("");
  // @NOTE: Fix up this type once vuetify team exposes their types
  const editFormRef = ref<typeof VForm & { errors: { id: string; errorMessages: string[] }[] }>();
  const editFormDialog = ref(false);
  const editedItem = ref<IItem | null>(null);
  const editedIndex = ref(-1);
  const isFullScreenDialog = ref(false);
  const isEditFormValid = computed(() => editFormRef.value?.errors.length === 0);
  const isSavable = computed(() => {
    if (!tableEditor.value) return;
    const originalItem = tableEditor.value.items.find((item) => item.id === editedItem.value?.id);
    if (!originalItem) return true;
    return isEditFormValid.value && !equal(editedItem.value, originalItem);
  });

  const editItem = (id: string) => {
    if (!tableEditor.value) return;

    const item = tableEditor.value.items.find((item) => item.id === id);
    if (!item) return;

    editedItem.value = structuredClone(toRaw(item));
    editedIndex.value = tableEditor.value.items.findIndex((item) => item.id === id);
    router.push({ ...router.currentRoute.value, query: { itemId: item.id } });
    editFormDialog.value = true;
  };
  const save = async () => {
    if (!tableEditor.value || !editedItem.value) return;

    if (editedIndex.value > -1) updateItem(editedItem.value);
    else createItem(editedItem.value);

    if (status.value === "authenticated") await $client.tableEditor.saveTableEditor.mutate(tableEditor.value);
    else localStorage.setItem(TABLE_EDITOR_STORE, JSON.stringify(tableEditor.value));
    editFormDialog.value = false;
  };
  const resetItem = () => {
    editedItem.value = null;
    editedIndex.value = -1;
  };

  return {
    tableEditor,
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
