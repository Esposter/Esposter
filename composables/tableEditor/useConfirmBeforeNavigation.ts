import { useTableEditorStore } from "@/store/tableEditor";

export const useConfirmBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isSavable } = storeToRefs(tableEditorStore);

  onBeforeRouteLeave((_, __, next) => {
    if (isSavable.value && !window.confirm("Changes that you made may not be saved.")) return false;
    next();
  });

  const refreshListener = (e: BeforeUnloadEvent) => {
    if (!isSavable.value) return;
    e.preventDefault();
    e.returnValue = "";
  };
  onBeforeMount(() => window.addEventListener("beforeunload", refreshListener));
  onBeforeUnmount(() => window.removeEventListener("beforeunload", refreshListener));
};
