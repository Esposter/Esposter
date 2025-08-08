<script setup lang="ts">
import { useMessageStore } from "@/store/esbabbler/message";
import { useReplyStore } from "@/store/esbabbler/reply";
import { useRoomStore } from "@/store/esbabbler/room";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });
useSubscribables();
const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
const route = useRoute();
const messageStore = useMessageStore();
const { messages } = storeToRefs(messageStore);
const replyStore = useReplyStore();
const { onIndicatorClick } = replyStore;
const rowKey = route.params.rowKey as string;

onMounted(() => {
  if (!rowKey) return;
  watchOnce(
    messages,
    () => {
      onIndicatorClick(rowKey);
    },
    { immediate: true },
  );
});
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
