<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const route = useRoute();
const { info, infoOpacity10 } = useColors();
const roomStore = useRoomStore();
const { currentRoomId, rooms, roomName, roomSearchQuery } = storeToRefs(roomStore);
const roomExists = computed(() => rooms.value.find((r) => r.id === currentRoomId.value));
currentRoomId.value = typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomSearchQuery.value = "";

useSubscribables();
</script>

<template>
  <NuxtLayout :main-style="{ 'max-height': '100vh' }">
    <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
    <template #left>
      <EsbabblerLeftSideBar />
    </template>
    <template v-if="roomExists" #right>
      <EsbabblerRightSideBar />
    </template>
    <template v-if="roomExists">
      <Head>
        <Title>{{ roomName }}</Title>
      </Head>
      <EsbabblerContent />
    </template>
    <template v-if="roomExists" #footer>
      <EsbabblerModelMessageInput />
    </template>
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.mention) {
  color: v-bind(info);
  background-color: v-bind(infoOpacity10);
  border-radius: 0.25rem;
}
</style>
