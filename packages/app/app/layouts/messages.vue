<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { useRoomStore } from "@/store/message/room";

useHead({ titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME} | ${title}` : MESSAGE_DISPLAY_NAME) });
useSubscribables();
const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
</script>

<template>
  <!-- We only want to show the inner scrollbar inside the chat content -->
  <NuxtLayout :footer-style="{ paddingBottom: 0 }" hide-global-scrollbar>
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
