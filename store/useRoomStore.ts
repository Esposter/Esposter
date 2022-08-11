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
    memberNextCursorMap: {} as Record<string, string | null>,
    messagesMap: {} as Record<string, MessageEntity[]>,
    messageNextCursorMap: {} as Record<string, string | null>,
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
      return state.roomSearchQuery
        ? state.roomListSearched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        : state.roomList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    roomNextCursor: (state) => {
      return state.roomSearchQuery ? state.roomListSearchedNextCursor : state.roomListNextCursor;
    },
    members: (state) => {
      if (!state.currentRoomId || !state.membersMap[state.currentRoomId]) return [];
      return state.membersMap[state.currentRoomId];
    },
    memberNextCursor: (state) => {
      if (!state.currentRoomId || !state.memberNextCursorMap[state.currentRoomId]) return null;
      return state.memberNextCursorMap[state.currentRoomId];
    },
    messages: (state) => {
      if (!state.currentRoomId || !state.messagesMap[state.currentRoomId]) return [];
      return state.messagesMap[state.currentRoomId];
    },
    messageNextCursor: (state) => {
      if (!state.currentRoomId || !state.messagesMap[state.currentRoomId]) return null;
      return state.messageNextCursorMap[state.currentRoomId];
    },
    messageInput: (state) => {
      if (!state.currentRoomId || !state.messageInputMap[state.currentRoomId]) return "";
      return state.messageInputMap[state.currentRoomId];
    },
  },
  actions: {
    createOrUpdateRoom(room: Room) {
      const index = this.roomList.findIndex((r) => r.id === room.id);
      if (index === -1) this.roomList.unshift(room);
      else this.roomList[index] = { ...this.roomList[index], ...room };
    },
    deleteRoom(id: string) {
      this.roomList = this.roomList.filter((r) => r.id !== id);
    },
    pushRooms(rooms: Room[]) {
      if (this.roomSearchQuery) this.roomListSearched.push(...rooms);
      else this.roomList.push(...rooms);
    },
    updateRoomNextCursor(roomNextCursor: string | null) {
      if (this.roomSearchQuery) this.roomListSearchedNextCursor = roomNextCursor;
      else this.roomListNextCursor = roomNextCursor;
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
    pushMessages(messages: MessageEntity[]) {
      if (!this.currentRoomId) return;

      this.messagesMap[this.currentRoomId].push(...messages);
    },
    updateMessageNextCursor(messageNextCursor: string | null) {
      if (!this.currentRoomId) return;

      this.messageNextCursorMap[this.currentRoomId] = messageNextCursor;
    },
    updateMessageInput(updatedMessageInput: string) {
      if (!this.currentRoomId) return;
      this.messageInputMap[this.currentRoomId] = updatedMessageInput;
    },
  },
});
