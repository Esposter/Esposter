export const usePollDialogStore = defineStore("message/pollDialog", () => {
  const isOpen = ref(false);
  const roomId = ref("");

  const open = (newRoomId: string) => {
    roomId.value = newRoomId;
    isOpen.value = true;
  };

  return { isOpen, open, roomId };
});
