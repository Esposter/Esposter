import { useTableEditorStore } from "@/store/tableEditor";

const editFormComponentFilepathEntries = Object.entries<Component>(
  import.meta.glob("@/components/TableEditor/**/Item/**/EditForm.vue", { eager: true, import: "default" }),
);

export const useEditFormComponent = (itemType: string) => {
  const tableEditorStore = useTableEditorStore();
  const { tableEditorType } = storeToRefs(tableEditorStore);
  let editFormComponent: Component | undefined;

  for (const [filepath, component] of editFormComponentFilepathEntries)
    if (typeof filepath === "string" && filepath.includes(`${tableEditorType.value}/Item/${itemType}`))
      editFormComponent = component;

  return editFormComponent;
};
