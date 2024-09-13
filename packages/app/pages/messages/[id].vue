<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";
import { uuidValidateV4 } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const { info, infoOpacity10 } = useColors();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName, roomList, roomSearchQuery } = storeToRefs(roomStore);
const roomExists = computed(() => roomList.value.find((r) => r.id === currentRoomId.value));
const route = useRoute();
const roomId = route.params.id;
currentRoomId.value = typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : null;
roomSearchQuery.value = "";

useSubscribables();
</script>

<template>
  <NuxtLayout :main-style="{ 'max-height': '100dvh' }">
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
        <Title>{{ currentRoomName }}</Title>
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
  border-radius: $border-radius-root;
}
</style>
