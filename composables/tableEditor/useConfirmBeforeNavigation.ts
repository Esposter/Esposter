import { useTableEditorStore } from "@/store/tableEditor";

export const useConfirmBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isDirty } = storeToRefs(tableEditorStore);

  onBeforeRouteLeave((_, __, next) => {
    if (isDirty.value && !window.confirm("Changes that you made may not be saved.")) return false;
    next();
  });

  const refreshListener = (e: BeforeUnloadEvent) => {
    if (!isDirty.value) return;
    e.preventDefault();
    e.returnValue = "";
  };
  onBeforeMount(() => window.addEventListener("beforeunload", refreshListener));
  onBeforeUnmount(() => window.removeEventListener("beforeunload", refreshListener));
};
