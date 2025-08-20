<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "@/services/esposter/constants";
import { useRoomStore } from "@/store/message/room";

useHead({ titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME} | ${title}` : MESSAGE_DISPLAY_NAME) });
useSubscribables();
const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
</script>

<template>
  <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
  <NuxtLayout :main-style="{ maxHeight: '100dvh' }" :footer-style="{ paddingBottom: 0 }">
    <Head>
      <Title>{{ currentRoomName }}</Title>
    </Head>
    <MessageContent />
    <template #left>
      <MessageLeftSideBar />
    </template>
    <template #right>
      <MessageRightSideBar />
    </template>
    <template #footer>
      <MessageModelMessageInput />
    </template>
  </NuxtLayout>
</template>
