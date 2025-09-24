<script setup lang="ts">
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { useRoomStore } from "@/store/message/room";

useHead({ titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME} | ${title}` : MESSAGE_DISPLAY_NAME) });
useSubscribables();
const { bottom, left, middle, right } = useFixedLayoutStyles();
const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
</script>

<template>
  <!-- Fix the layout structure so navigating does not cause a layout shift -->
  <NuxtLayout
    :footer-style="{ ...bottom, paddingBottom: 0 }"
    :left-navigation-drawer-props="{ style: left }"
    :right-navigation-drawer-props="{ style: right }"
    :main-style="{
      ...middle,
      // Set max height here so we can hide global window scrollbar
      // and show scrollbar within the chat content only for chat routes
      maxHeight: '100dvh',
    }"
  >
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
