import { useTableEditorStore } from "@/store/tableEditor";

export const useConfirmBeforeNavigation = () => {
  const tableEditorStore = useTableEditorStore()();
  const { isDirty } = storeToRefs(tableEditorStore);

  onBeforeRouteLeave(() => {
    if (isDirty.value && !window.confirm("Changes that you made may not be saved.")) return false;
  });

  const listener = (e: BeforeUnloadEvent) => {
    if (!isDirty.value) return;
    e.preventDefault();
    e.returnValue = "";
  };
  onBeforeMount(() => window.addEventListener("beforeunload", listener));
  onBeforeUnmount(() => window.removeEventListener("beforeunload", listener));
};
