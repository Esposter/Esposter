<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";

useHead({ titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME} | ${title}` : MESSAGE_DISPLAY_NAME) });
useSubscribables();
const roomName = useRoomName();
</script>

<template>
  <!-- We only want to show the inner scrollbar inside the chat content -->
  <NuxtLayout :footer-style="{ paddingBottom: 0 }" hide-global-scrollbar>
    <Head>
      <Title>{{ roomName }}</Title>
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
