import { useTableEditorStore } from "@/store/tableEditor";

const editFormComponentFilepathEntries = Object.entries(
  import.meta.glob<Component>("@/components/TableEditor/**/EditForm.vue", { eager: true, import: "default" }),
);

export const useEditFormComponent = (itemType: string) => {
  const tableEditorStore = useTableEditorStore();
  const { tableEditorType } = storeToRefs(tableEditorStore);

  for (const [filepath, component] of editFormComponentFilepathEntries)
    if (
      typeof filepath === "string" &&
      (filepath.endsWith(`${tableEditorType.value}/${itemType}/EditForm.vue`) ||
        filepath.endsWith(`${tableEditorType.value}/EditForm.vue`))
    )
      return component;

  return undefined;
};
