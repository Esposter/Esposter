<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { useRoomStore } from "@/store/esbabbler/room";

definePageMeta({ middleware: "auth", validate });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

useSubscribables();

const roomStore = useRoomStore();
const { currentRoomId, currentRoomName, rooms } = storeToRefs(roomStore);
const isRoomExisting = computed(() => rooms.value.some(({ id }) => id === currentRoomId.value));
</script>

<template>
  <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
  <NuxtLayout :main-style="{ maxHeight: '100dvh' }">
    <template #left>
      <EsbabblerLeftSideBar />
    </template>
    <template v-if="isRoomExisting" #right>
      <EsbabblerRightSideBar />
    </template>
    <template v-if="isRoomExisting">
      <Head>
        <Title>{{ currentRoomName }}</Title>
      </Head>
      <EsbabblerContent />
    </template>
    <template v-if="isRoomExisting" #footer>
      <EsbabblerModelMessageInput />
    </template>
  </NuxtLayout>
</template>
