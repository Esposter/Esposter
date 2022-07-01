import type { ChatMessage, ChatRoom } from "@/components/Chat/types";
import type { User } from "@/store/useUserStore";
import { defineStore } from "pinia";

export const useRoomStore = defineStore({
  id: "roomStore",
  state: () => ({
    currentRoomId: null as string | null,
    roomSearchQuery: "",
    roomList: [] as ChatRoom[],
    membersMap: {} as Record<string, User[]>,
    messagesMap: {} as Record<string, ChatMessage[]>,
    messageInputMap: {} as Record<string, string>,
  }),
  getters: {
    name: (state) => {
      if (!state.currentRoomId) return "";

      const currentRoom = state.roomList.find((r) => r.id === state.currentRoomId);
      return currentRoom?.name ?? "";
    },
    filteredRoomList: (state) => {
      if (!state.roomSearchQuery) return state.roomList;
      return state.roomList.filter((r) => r.name.toLowerCase().includes(state.roomSearchQuery.toLowerCase()));
    },
    members: (state) => {
      if (!state.currentRoomId || !state.membersMap[state.currentRoomId]) return [];
      return state.membersMap[state.currentRoomId];
    },
    messages: (state) => {
      if (!state.currentRoomId || !state.messagesMap[state.currentRoomId]) return [];
      return state.messagesMap[state.currentRoomId];
    },
    messageInput: (state) => {
      if (!state.currentRoomId || !state.messageInputMap[state.currentRoomId]) return "";
      return state.messageInputMap[state.currentRoomId];
    },
  },
  actions: {
    updateMessageInput(newMessageInput: string) {
      if (!this.currentRoomId) return;
      this.messageInputMap[this.currentRoomId] = newMessageInput;
    },
    sendMessage() {
      this.updateMessageInput("");
    },
  },
});
