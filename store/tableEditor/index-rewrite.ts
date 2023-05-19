import type { Item } from "@/models/tableEditor/Item";
import type { TableEditor } from "@/models/tableEditor/TableEditor";
import { ITEM_ID_QUERY_PARAM_KEY, TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import equal from "deep-equal";
import { UnwrapRef } from "vue";
import { VForm } from "vuetify/components";

// @NOTE: This doesn't actually work yet
// https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
export const useTableEditorStore = <T extends Item>() =>
  defineStore("tableEditor", () => {
    const { $client } = useNuxtApp();
    const { status } = useAuth();
    const router = useRouter();
    const itemStore = useItemStore();
    const { createItem, updateItem, deleteItem } = itemStore;

    const tableEditor = ref<TableEditor<T> | null>(null);
    const searchQuery = ref("");
    const editFormRef = ref<typeof VForm & { errors: { id: string; errorMessages: string[] }[] }>();
    const editFormDialog = ref(false);
    const editedItem = ref<T | null>(null);
    const editedIndex = ref(-1);
    const isFullScreenDialog = ref(false);
    const isEditFormValid = computed(() => editFormRef.value?.errors.length === 0);
    const isSavable = computed(() => {
      if (!tableEditor.value || !editedItem.value) return;

      const originalItem = tableEditor.value.items.find((item) => item.id === editedItem.value?.id);
      if (!originalItem) return true;
      return isEditFormValid.value && !equal(editedItem.value, originalItem);
    });

    const editItem = (id: string) => {
      if (!tableEditor.value) return;

      const item = tableEditor.value.items.find((item) => item.id === id);
      if (!item) return;

      // @NOTE: Type bug here so we cast it for now
      editedItem.value = structuredClone(toDeepRaw(item)) as UnwrapRef<T>;
      editedIndex.value = tableEditor.value.items.findIndex((item) => item.id === id);
      router.replace({ ...router.currentRoute.value, query: { [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
      editFormDialog.value = true;
    };
    const save = async (isDeleteAction?: true) => {
      if (!tableEditor.value || !editedItem.value) return;

      if (isDeleteAction) deleteItem(editedItem.value.id);
      else if (editedIndex.value > -1) updateItem(editedItem.value);
      else createItem(editedItem.value);

      if (status.value === "authenticated") await $client.tableEditor.saveTableEditor.mutate(tableEditor.value);
      else localStorage.setItem(TABLE_EDITOR_STORE, JSON.stringify(tableEditor.value));
      editFormDialog.value = false;
    };
    const resetItem = () => {
      editedItem.value = null;
      editedIndex.value = -1;
      router.replace({ query: undefined });
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
