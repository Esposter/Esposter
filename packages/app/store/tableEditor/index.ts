import type { Item } from "@/models/tableEditor/Item";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useItemStore } from "@/store/tableEditor/item";
import { structuredCloneClass } from "@/util/class/structuredCloneClass";
import { toDeepRaw } from "@/util/reactivity/toDeepRaw";
import deepEqual from "fast-deep-equal";
import type { VForm } from "vuetify/components";

interface TableEditorState<TItem extends Item = Item> {
  tableEditorConfiguration: TableEditorConfiguration;
  tableEditorType: TableEditorType;
  searchQuery: string;
  editFormDialog: boolean;
  editFormRef: InstanceType<typeof VForm> | undefined;
  editedItem: TItem | null;
  editedIndex: number;
  isFullScreenDialog: boolean;
}

export const useTableEditorStore = <TItem extends Item = Item>() =>
  defineStore("tableEditor", {
    state: (): TableEditorState<TItem> => ({
      tableEditorConfiguration: new TableEditorConfiguration(),
      tableEditorType: TableEditorType.TodoList,
      searchQuery: "",
      editFormRef: undefined,
      editFormDialog: false,
      editedItem: null,
      editedIndex: -1,
      isFullScreenDialog: false,
    }),
    getters: {
      tableEditor(): { items: TItem[] } {
        return this.tableEditorConfiguration[this.tableEditorType] as { items: TItem[] };
      },
      originalItem(): TItem | null {
        const id = this.editedItem?.id;
        if (!id) return null;
        return this.tableEditor.items.find((i) => i.id === id) ?? null;
      },
      isEditFormValid(): boolean {
        // The form is "valid" if there's no form open/no errors
        return !this.editFormRef || this.editFormRef.errors.length === 0;
      },
      isSavable(): boolean {
        if (!this.editedItem) return false;
        // For the form to be savable, it has to have no errors
        // and either it is a new item, or it is not equal to the original item
        else return this.isEditFormValid && (!this.originalItem || !deepEqual(this.editedItem, this.originalItem));
      },
      isDirty(): boolean {
        // We know the form is dirty if:
        // 1. The user has pucked up and the edit form isn't valid
        // 2. or that it is savable
        return !this.isEditFormValid || this.isSavable;
      },
    },
    actions: {
      async editItem(id: string) {
        const item = this.tableEditor.items.find((item) => item.id === id);
        if (!item) return;
        // @TODO: Vue cannot unwrap generic refs yet
        this.editedItem = reactive(structuredCloneClass(toDeepRaw(item))) as typeof this.editedItem;
        this.editedIndex = this.tableEditor.items.findIndex((item) => item.id === id);
        this.editFormDialog = true;

        const router = useRouter();
        await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: item.id } });
      },
      async save(isDeleteAction?: true) {
        if (!this.editedItem) return;

        const { $client } = useNuxtApp();
        const { status } = useAuth();
        const itemStore = useItemStore();
        const { createItem, updateItem, deleteItem } = itemStore;

        if (isDeleteAction) deleteItem(this.editedItem.id);
        else if (this.editedIndex > -1) updateItem(this.editedItem);
        else createItem(this.editedItem);

        if (status.value === "authenticated")
          await $client.tableEditor.saveTableEditor.mutate(this.tableEditorConfiguration);
        else if (status.value === "unauthenticated")
          localStorage.setItem(TABLE_EDITOR_LOCAL_STORAGE_KEY, this.tableEditorConfiguration.toJSON());
        this.editFormDialog = false;
      },
      async resetItem() {
        this.editedItem = null;
        this.editedIndex = -1;

        const router = useRouter();
        await router.replace({ query: { ...router.currentRoute.value.query, [ITEM_ID_QUERY_PARAM_KEY]: undefined } });
      },
    },
  });
