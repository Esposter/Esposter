import type { User } from "@/server/trpc/user";
import type { MessageEntity } from "@/services/azure/types";
import type { Room } from "@prisma/client";
import { defineStore } from "pinia";

export const useRoomStore = defineStore({
  id: "roomStore",
  state: () => ({
    currentRoomId: null as string | null,
    roomSearchQuery: "",
    roomList: [] as Room[],
    roomNextCursor: null as string | null,
    membersMap: {} as Record<string, User[]>,
    messagesMap: {} as Record<string, MessageEntity[]>,
    messageInputMap: {} as Record<string, string>,
  }),
  getters: {
    name: (state) => {
      if (!state.currentRoomId) return "";

      const currentRoom = state.roomList.find((r) => r.id === state.currentRoomId);
      return currentRoom?.name ?? "";
    },
    rooms: (state) => {
      // @NOTE Remove manually changing to date after adding superjson transformer
      return state.roomList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    updateRoom(updatedRoom: Room) {
      if (!this.currentRoomId) return;

      const index = this.roomList.findIndex((r) => r.id === this.currentRoomId);
      if (index > -1) this.roomList[index] = { ...this.roomList[index], ...updatedRoom };
    },
    deleteRoom(id: string) {
      this.roomList = this.roomList.filter((r) => r.id !== id);
    },
    createMessage(newMessage: MessageEntity) {
      if (!this.currentRoomId) return;
      this.messagesMap[this.currentRoomId] = [newMessage, ...this.messagesMap[this.currentRoomId]];
    },
    updateMessageInput(updatedMessageInput: string) {
      if (!this.currentRoomId) return;
      this.messageInputMap[this.currentRoomId] = updatedMessageInput;
    },
  },
});
