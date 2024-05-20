import { useTableEditorStore } from "@/store/tableEditor";

export const useConfirmBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isDirty } = storeToRefs(tableEditorStore);

  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes that you made may not be saved.")) return false;
  });

  useEventListener("beforeunload", ({ preventDefault }) => {
    if (!isDirty.value) return;
    preventDefault();
  });
};
