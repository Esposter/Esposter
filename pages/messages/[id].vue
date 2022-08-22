<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { uuidValidateV4 } from "@/util";
import { storeToRefs } from "pinia";

useHead({ titleTemplate: (title) => `Esbabbler | ${title}` });

const route = useRoute();
const roomStore = useRoomStore();
const { currentRoomId, roomList, roomName } = storeToRefs(roomStore);
const roomExists = computed(() => roomList.value.find((r) => r.id === currentRoomId.value));
roomStore.currentRoomId =
  typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomStore.roomSearchQuery = "";
</script>

<template>
  <div display="contents">
    <Head>
      <Title>{{ roomName }}</Title>
    </Head>
    <NuxtLayout mainClass="max-h-screen">
      <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
      <template #left>
        <ChatLeftSideBar />
      </template>
      <template #right v-if="roomExists">
        <ChatRightSideBar />
      </template>
      <template #default="props" v-if="roomExists">
        <ChatContent :="props" />
      </template>
      <template #footer v-if="roomExists">
        <ChatMessageInput />
      </template>
    </NuxtLayout>
  </div>
</template>
