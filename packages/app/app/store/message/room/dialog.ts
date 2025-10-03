export const useDialogStore = defineStore("message/room/dialog", () => {
  const isEditRoomDialogOpen = ref(false);
  return {
    isEditRoomDialogOpen,
  };
});
