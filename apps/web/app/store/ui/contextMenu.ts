import type { UiContextMenu } from "@/models/ui/UiContextMenu";

// What the one mounted context menu shows, where, and what opened it, so a list of thousands of rows mounts one menu
// Rather than one per row
export const useContextMenuStore = defineStore("ui/contextMenu", () => {
  const contextMenu = ref<UiContextMenu>();
  const openContextMenu = (newContextMenu: UiContextMenu) => {
    contextMenu.value = newContextMenu;
  };
  const closeContextMenu = () => {
    contextMenu.value = undefined;
  };
  return { closeContextMenu, contextMenu, openContextMenu };
});
