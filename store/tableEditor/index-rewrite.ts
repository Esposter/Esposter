import { type Item } from "@/models/tableEditor/Item";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { type VFormRef } from "@/models/vuetify/VFormRef";
import { ITEM_ID_QUERY_PARAM_KEY, TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import { toDeepRaw } from "@/util/reactivity";
import equal from "deep-equal";
import { type UnwrapRef } from "vue";

// @TODO: Vue cannot unwrap generic refs yet
// https://github.com/vuejs/core/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+unwrap
// https://github.com/vuejs/core/issues/6766
export const useTableEditorStore = <TItem extends Item = Item>() =>
  defineStore("tableEditor", () => {
    const { $client } = useNuxtApp();
    const { status } = useAuth();
    const router = useRouter();
    const itemStore = useItemStore();
    const { createItem, updateItem, deleteItem } = itemStore;

    const tableEditorConfiguration = ref(new TableEditorConfiguration());
    const tableEditorType = ref(TableEditorType.TodoList);
    const tableEditor = computed(() => tableEditorConfiguration.value[tableEditorType.value] as { items: TItem[] });
    const searchQuery = ref("");
    const editFormRef = ref<VFormRef>();
    const editFormDialog = ref(false);
    const editedItem = ref<TItem | null>(null);
    const editedIndex = ref(-1);
    const isFullScreenDialog = ref(false);
    // The form is "valid" if there's no form open/no errors
    const isEditFormValid = computed(() => !editFormRef.value || editFormRef.value.errors.length === 0);
    const isSavable = computed(() => {
      if (!editedItem.value) return false;

      const originalItem = tableEditor.value.items.find((item) => item.id === editedItem.value?.id);
      // For the form to be savable, it has to have no errors
      // and either it is a new item, or it is not equal to the original item
      return isEditFormValid.value && (!originalItem || !equal(editedItem.value, originalItem));
    });
    // We know the form is dirty if:
    // 1. The user has pucked up and the edit form isn't valid
    // 2. or that it is savable
    const isDirty = computed(() => !isEditFormValid.value || isSavable.value);

    const editItem = async (id: string) => {
      const item = tableEditor.value.items.find((item) => item.id === id);
      if (!item) return;

      // @TODO: Vue cannot unwrap generic refs yet
      editedItem.value = structuredClone(toDeepRaw(item)) as UnwrapRef<TItem>;
      editedIndex.value = tableEditor.value.items.findIndex((item) => item.id === id);
      editFormDialog.value = true;
      await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
    };
    const save = async (isDeleteAction?: true) => {
      if (!editedItem.value) return;

      if (isDeleteAction) deleteItem(editedItem.value.id);
      else if (editedIndex.value > -1) updateItem(editedItem.value);
      else createItem(editedItem.value);

      if (status.value === "authenticated")
        await $client.tableEditor.saveTableEditor.mutate(tableEditorConfiguration.value);
      else if (status.value === "unauthenticated")
        localStorage.setItem(TABLE_EDITOR_STORE, tableEditorConfiguration.value.toJSON());
      editFormDialog.value = false;
    };
    const resetItem = async () => {
      editedItem.value = null;
      editedIndex.value = -1;
      await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: undefined } });
    };

    return {
      tableEditorConfiguration,
      tableEditor,
      searchQuery,
      editFormRef,
      editFormDialog,
      editedItem,
      editedIndex,
      isFullScreenDialog,
      isEditFormValid,
      isSavable,
      isDirty,
      editItem,
      save,
      resetItem,
    };
  });
