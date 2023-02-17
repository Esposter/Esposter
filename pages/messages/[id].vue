<script setup lang="ts">
import { useRoomStore } from "@/store/chat/useRoomStore";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const route = useRoute();
const roomStore = useRoomStore();
const { currentRoomId, rooms, roomName, roomSearchQuery } = storeToRefs(roomStore);
const roomExists = $computed(() => rooms.value.find((r) => r.id === currentRoomId.value));
currentRoomId.value = typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomSearchQuery.value = "";

useSubscribables();
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
      <ChatModelMessageInput />
    </template>
  </NuxtLayout>
</template>
