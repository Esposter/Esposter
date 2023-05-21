import { useTableEditorStore } from "@/store/tableEditor";

const EditFormComponentFilepathEntries = Object.entries(
  import.meta.glob("@/components/TableEditor/**/Item/**/EditForm.vue", { eager: true, import: "default" })
);

export const getEditFormComponent = <T extends string>(itemType: T) => {
  const tableEditorStore = useTableEditorStore()();
  const { tableEditorType } = storeToRefs(tableEditorStore);
  return EditFormComponentFilepathEntries.find((filepath) =>
    filepath[0].includes(`${tableEditorType.value}/Item/${itemType}`)
  )?.[1] as Component | undefined;
};
