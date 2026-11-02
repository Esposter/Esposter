// The whiteboard's dialog targets: the elements a delete asks about, held until the owner answers the question
export const useWhiteboardDialogStore = defineStore("resource/whiteboard/dialog", () => {
  const deletingIds = ref<string[]>([]);
  return { deletingIds };
});
