import { defineStore } from "pinia";

export const useRoomStore = defineStore({
  id: "roomStore",
  state: () => ({ currentRoomId: null as string | null, messageMap: {} as Record<string, string> }),
  getters: {
    message: (state) => {
      if (!state.currentRoomId || !state.messageMap[state.currentRoomId]) return "";
      return state.messageMap[state.currentRoomId];
    },
  },
  actions: {
    updateMessage(newMessage: string) {
      if (!this.currentRoomId) return;
      this.messageMap[this.currentRoomId] = newMessage;
    },
  },
});
