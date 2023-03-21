import { ItemType } from "@/models/tableEditor/ItemType";

export const SAVE_FILENAME = "save.json";

// local storage key
export const TABLE_EDITOR_STORE = "table-editor-store";

export const ITEM_ID_QUERY_PARAM_KEY = "itemId";

const editFormComponentEntries = Object.entries(
  import.meta.glob("@/components/TableEditor/**/EditForm.vue", { eager: true, import: "default" })
);
export const EditFormMap = Object.fromEntries(
  Object.values(ItemType).map((i) => [i, editFormComponentEntries.find((c) => c[0].includes(i))?.[1]])
) as Record<ItemType, Component>;
