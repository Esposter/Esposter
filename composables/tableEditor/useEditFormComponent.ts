import { useTableEditorStore } from "@/store/tableEditor";

const editFormComponentFilepathEntries = Object.entries<Component>(
  import.meta.glob("@/components/TableEditor/**/Item/**/EditForm.vue", { eager: true, import: "default" }),
);

export const useEditFormComponent = <T extends string>(itemType: T) => {
  const tableEditorStore = useTableEditorStore()();
  const { tableEditorType } = storeToRefs(tableEditorStore);
  let editFormComponent: Component | null = null;

  for (const [filepath, component] of editFormComponentFilepathEntries)
    if (filepath.includes(`${tableEditorType.value}/Item/${itemType}`)) editFormComponent = component;

  return editFormComponent;
};
