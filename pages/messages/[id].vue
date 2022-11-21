<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { uuidValidateV4 } from "@/util/uuid";
import { storeToRefs } from "pinia";

const route = useRoute();
const roomStore = useRoomStore();
const { currentRoomId, rooms, roomName } = $(storeToRefs(roomStore));
const roomExists = $computed(() => rooms.find((r) => r.id === currentRoomId));
roomStore.currentRoomId =
  typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomStore.roomSearchQuery = "";

useHead({ title: roomName, titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });
</script>

<template>
  <NuxtLayout>
    <template #left>
      <ChatLeftSideBar />
    </template>
    <template v-if="roomExists" #right>
      <ChatRightSideBar />
    </template>
    <template v-if="roomExists" #default="props">
      <ChatContent :="props" />
    </template>
    <template v-if="roomExists" #footer>
      <ChatMessageInput />
    </template>
  </NuxtLayout>
</template>
