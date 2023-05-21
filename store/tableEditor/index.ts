import type { Item } from "@/models/tableEditor/Item";
import type { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { ITEM_ID_QUERY_PARAM_KEY, TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import equal from "deep-equal";
import type { UnwrapRef } from "vue";
import { VForm } from "vuetify/components";

interface TableEditorState<TItem extends Item = Item> {
  tableEditorConfiguration: TableEditorConfiguration | null;
  tableEditorType: TableEditorType;
  searchQuery: string;
  editFormRef: (typeof VForm & { errors: { id: string; errorMessages: string[] }[] }) | undefined;
  editFormDialog: boolean;
  editedItem: TItem | null;
  editedIndex: number;
  isFullScreenDialog: boolean;
}

export const useTableEditorStore = <TItem extends Item = Item>() =>
  defineStore("tableEditor", {
    state: (): TableEditorState<TItem> => ({
      tableEditorConfiguration: null,
      tableEditorType: TableEditorType.TodoList,
      searchQuery: "",
      editFormRef: undefined,
      editFormDialog: false,
      editedItem: null,
      editedIndex: -1,
      isFullScreenDialog: false,
    }),
    getters: {
      tableEditor(): { items: TItem[] } | null {
        return this.tableEditorConfiguration
          ? (this.tableEditorConfiguration[this.tableEditorType] as { items: TItem[] })
          : null;
      },
      isEditFormValid(): boolean {
        return this.editFormRef?.errors.length === 0;
      },
      isSavable(): boolean {
        if (!this.tableEditor || !this.editedItem) return false;

        const originalItem = this.tableEditor.items.find((item) => item.id === this.editedItem?.id);
        if (!originalItem) return true;
        return this.isEditFormValid && !equal(this.editedItem, originalItem);
      },
    },
    actions: {
      editItem(id: string) {
        if (!this.tableEditor) return;

        const item = this.tableEditor.items.find((item) => item.id === id);
        if (!item) return;

        const router = useRouter();
        this.editedItem = structuredClone(toDeepRaw(item)) as UnwrapRef<TItem>;
        this.editedIndex = this.tableEditor.items.findIndex((item) => item.id === id);
        router.replace({ ...router.currentRoute.value, query: { [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
        this.editFormDialog = true;
      },
      async save(isDeleteAction?: true) {
        if (!this.tableEditorConfiguration || !this.editedItem) return;

        const { $client } = useNuxtApp();
        const { status } = useAuth();
        const itemStore = useItemStore();
        const { createItem, updateItem, deleteItem } = itemStore;

        if (isDeleteAction) deleteItem(this.editedItem.id);
        else if (this.editedIndex > -1) updateItem(this.editedItem);
        else createItem(this.editedItem);

        if (status.value === "authenticated")
          await $client.tableEditor.saveTableEditor.mutate(this.tableEditorConfiguration);
        else localStorage.setItem(TABLE_EDITOR_STORE, JSON.stringify(this.tableEditorConfiguration));
        this.editFormDialog = false;
      },
      resetItem() {
        const router = useRouter();
        this.editedItem = null;
        this.editedIndex = -1;
        router.replace({ query: undefined });
      },
    },
  });
