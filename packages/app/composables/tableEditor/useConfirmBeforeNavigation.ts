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
    // Even though the docs tell us that it's deprecated,
    // this actually makes the window prompt for reloading pop up
    e.returnValue = false;
  });
};