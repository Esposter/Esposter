import { useTableEditorStore } from "@/store/tableEditor";

export const useConfirmBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isDirty } = storeToRefs(tableEditorStore);

  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes that you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", (e) => {
    if (!isDirty.value) return;
    e.preventDefault();
    e.returnValue = "";
  });
};
