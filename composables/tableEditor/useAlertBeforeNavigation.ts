import { useTableEditorStore } from "@/store/tableEditor";

export const useAlertBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isSavable } = storeToRefs(tableEditorStore);

  const confirmNavigation = () => !isSavable.value || window.confirm("Changes that you made may not be saved.");
  onBeforeRouteLeave((_, __, next) => {
    if (!confirmNavigation()) return false;
    next();
  });

  const refreshListener = (e: BeforeUnloadEvent) => {
    if (confirmNavigation()) return;
    e.preventDefault();
  };
  onBeforeMount(() => window.addEventListener("beforeunload", refreshListener));
  onBeforeUnmount(() => window.removeEventListener("beforeunload", refreshListener));
};
