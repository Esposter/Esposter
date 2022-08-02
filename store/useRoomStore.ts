import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/message";
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
    roomListNextCursor: null as string | null,
    roomListSearched: [] as Room[],
    roomListSearchedNextCursor: null as string | null,
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
      if (state.roomSearchQuery)
        return state.roomListSearched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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

      const messages = this.messagesMap[this.currentRoomId];
      this.messagesMap[this.currentRoomId] = [newMessage, ...messages];
    },
    updateMessage(updatedMessage: UpdateMessageInput) {
      if (!this.currentRoomId) return;

      const messages = this.messagesMap[this.currentRoomId];
      const index = messages.findIndex(
        (m) => m.partitionKey === updatedMessage.partitionKey && m.rowKey === updatedMessage.rowKey
      );
      if (index > -1) this.messagesMap[this.currentRoomId][index] = { ...messages[index], ...updatedMessage };
    },
    deleteMessage(id: DeleteMessageInput) {
      if (!this.currentRoomId) return;

      const messages = this.messagesMap[this.currentRoomId];
      this.messagesMap[this.currentRoomId] = messages.filter(
        (m) => !(m.partitionKey === id.partitionKey && m.rowKey === id.rowKey)
      );
    },
    updateMessageInput(updatedMessageInput: string) {
      if (!this.currentRoomId) return;
      this.messageInputMap[this.currentRoomId] = updatedMessageInput;
    },
  },
});
