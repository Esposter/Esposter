<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
  
definePageMeta({ middleware: "auth" });

const route = useRoute();
const roomStore = useRoomStore();
const { currentRoomId, rooms, roomName } = $(storeToRefs(roomStore));
const roomExists = $computed(() => rooms.find((r) => r.id === currentRoomId));
roomStore.currentRoomId =
  typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomStore.roomSearchQuery = "";

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });
</script>

<template>
  <NuxtLayout :main-style="{ 'max-height': '100vh' }">
    <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
    <template #left>
      <ChatLeftSideBar />
    </template>
    <template v-if="roomExists" #right>
      <ChatRightSideBar />
    </template>
    <template v-if="roomExists">
      <Head>
        <Title>{{ roomName }}</Title>
      </Head>
      <ChatContent />
    </template>
    <template v-if="roomExists" #footer>
      <ChatMessageInput />
    </template>
  </NuxtLayout>
</template>
