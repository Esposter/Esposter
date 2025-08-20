<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });
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
    <EsbabblerContent />
    <template #left>
      <EsbabblerLeftSideBar />
    </template>
    <template #right>
      <EsbabblerRightSideBar />
    </template>
    <template #footer>
      <EsbabblerModelMessageInput />
    </template>
  </NuxtLayout>
</template>
