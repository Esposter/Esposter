<script setup lang="ts">
import { useRoomStore } from "@/store/esbabbler/room";
import { uuidValidateV4 } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const { info, infoOpacity10 } = useColors();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName, roomList, roomSearchQuery } = storeToRefs(roomStore);
const isRoomExisting = computed(() => roomList.value.some((r) => r.id === currentRoomId.value));
const route = useRoute();
const roomId = route.params.id;
currentRoomId.value = typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : null;
roomSearchQuery.value = "";

useSubscribables();
</script>

<template>
  <!-- Set max height here so we can hide global window scrollbar
    and show scrollbar within the chat content only for chat routes -->
  <NuxtLayout :main-style="{ 'max-height': '100dvh' }" :left-navigation-drawer-props="{ permanent: true }">
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

<style scoped lang="scss">
:deep(.mention) {
  color: v-bind(info);
  background-color: v-bind(infoOpacity10);
  border-radius: $border-radius-root;
}
</style>
