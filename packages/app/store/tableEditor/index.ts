import type { Item } from "@/models/tableEditor/Item";
import type { VForm } from "vuetify/components";

import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";
import deepEqual from "fast-deep-equal";

interface TableEditorState<TItem extends Item = Item> {
  editedIndex: number;
  editedItem: null | TItem;
  editFormDialog: boolean;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isFullScreenDialog: boolean;
  searchQuery: string;
  tableEditorConfiguration: TableEditorConfiguration;
  tableEditorType: TableEditorType;
}

export const useTableEditorStore = <TItem extends Item = Item>() =>
  defineStore("tableEditor", {
    actions: {
      async editItem(id: string) {
        const item = this.tableEditor.items.find((item) => item.id === id);
        if (!item) return;
        // @TODO: Vue cannot unwrap generic refs yet
        this.editedItem = structuredClone(toDeepRaw(item)) as typeof this.editedItem;
        this.editedIndex = this.tableEditor.items.findIndex((item) => item.id === id);
        this.editFormDialog = true;

        const router = useRouter();
        await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
      },
      async resetItem() {
        this.editedItem = null;
        this.editedIndex = -1;

        const router = useRouter();
        await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: undefined } });
      },
      async save(isDeleteAction?: true) {
        if (!this.editedItem) return;

        const { $client } = useNuxtApp();
        const { status } = useAuth();
        const itemStore = useItemStore();
        const { createItem, deleteItem, updateItem } = itemStore;

        if (isDeleteAction) deleteItem(this.editedItem.id);
        else if (this.editedIndex > -1) updateItem(this.editedItem);
        else createItem(this.editedItem);

        if (status.value === "authenticated")
          await $client.tableEditor.saveTableEditor.mutate(this.tableEditorConfiguration);
        else if (status.value === "unauthenticated")
          localStorage.setItem(TABLE_EDITOR_LOCAL_STORAGE_KEY, this.tableEditorConfiguration.toJSON());
        this.editFormDialog = false;
      },
    },
    getters: {
      isDirty(): boolean {
        // We know the form is dirty if:
        // 1. The user has pucked up and the edit form isn't valid
        // 2. or that it is savable
        return !this.isEditFormValid || this.isSavable;
      },
      isEditFormValid(): boolean {
        // The form is "valid" if there's no form open/no errors
        return !this.editFormRef || this.editFormRef.errors.length === 0;
      },
      isSavable(): boolean {
        if (!this.editedItem) return false;
        // For the form to be savable, it has to have no errors
        // and either it is a new item, or it is not equal to the original item
        else
          return (
            this.isEditFormValid &&
            // The edited item is a clone of original item which does not clone the class information
            // so it's not "strictly" equal including the Object prototype
            (!this.originalItem || !deepEqual(this.editedItem, structuredClone(toDeepRaw(this.originalItem))))
          );
      },
      originalItem(): null | TItem {
        const id = this.editedItem?.id;
        if (!id) return null;
        return this.tableEditor.items.find((i) => i.id === id) ?? null;
      },
      tableEditor(): { items: TItem[] } {
        return this.tableEditorConfiguration[this.tableEditorType] as { items: TItem[] };
      },
    },
    state: (): TableEditorState<TItem> => ({
      editedIndex: -1,
      editedItem: null,
      editFormDialog: false,
      editFormRef: undefined,
      isFullScreenDialog: false,
      searchQuery: "",
      tableEditorConfiguration: new TableEditorConfiguration(),
      tableEditorType: TableEditorType.TodoList,
    }),
  });
