import type { Message, Room } from "@/server/trpc/room";
import type { User } from "@/server/trpc/user";
import { defineStore } from "pinia";

export const useRoomStore = defineStore({
  id: "roomStore",
  state: () => ({
    currentRoomId: null as string | null,
    roomSearchQuery: "",
    roomList: [] as Room[],
    membersMap: {} as Record<string, User[]>,
    messagesMap: {} as Record<string, Message[]>,
    messageInputMap: {} as Record<string, string>,
  }),
  getters: {
    name: (state) => {
      if (!state.currentRoomId) return "";

      const currentRoom = state.roomList.find((r) => r.id === state.currentRoomId);
      return currentRoom?.name ?? "";
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
    createRoom(newRoom: Room) {
      this.roomList.unshift(newRoom);
    },
    deleteRoom(id: string) {
      this.roomList = this.roomList.filter((r) => r.id !== id);
    },
    createMessage(newMessage: Message) {
      if (!this.currentRoomId) return;
      this.messagesMap[this.currentRoomId] = [newMessage, ...this.messagesMap[this.currentRoomId]];
    },
    updateMessageInput(newMessageInput: string) {
      if (!this.currentRoomId) return;
      this.messageInputMap[this.currentRoomId] = newMessageInput;
    },
  },
});
