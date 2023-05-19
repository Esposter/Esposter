export const SAVE_FILENAME = "save.json";

// local storage key
export const TABLE_EDITOR_STORE = "table-editor-store";

export const ITEM_ID_QUERY_PARAM_KEY = "itemId";

const EditFormComponentFilepathEntries = Object.entries(
  import.meta.glob("@/components/TableEditor/**/EditForm.vue", { eager: true, import: "default" })
);
export const GetEditFormMap = <T extends string>(itemType: T) =>
  Object.fromEntries(
    Object.values(itemType).map((type) => [
      type,
      EditFormComponentFilepathEntries.find((filepath) => filepath[0].includes(type))?.[1],
    ])
  ) as Record<T, Component>;
