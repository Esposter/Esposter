<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { uuidValidateV4 } from "@/util/uuid";
import { storeToRefs } from "pinia";

useHead({ titleTemplate: (title) => (title ? `Esbabbler | ${title}` : "Esbabbler") });

const route = useRoute();
const roomStore = useRoomStore();
const { currentRoomId, rooms, roomName } = storeToRefs(roomStore);
const roomExists = $computed(() => rooms.value.find((r) => r.id === currentRoomId.value));
roomStore.currentRoomId =
  typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
roomStore.roomSearchQuery = "";
</script>

<template>
  <div display="contents">
    <Head>
      <Title>{{ roomName }}</Title>
    </Head>
    <NuxtLayout>
      <template #left>
        <ChatLeftSideBar />
      </template>
      <template v-if="roomExists" #right>
        <ChatRightSideBar />
      </template>
      <template v-if="roomExists" #default="props">
        <ChatContent :="props" />
      </template>
      <template v-if="roomExists" #footer>
        <ChatMessageInput />
      </template>
    </NuxtLayout>
  </div>
</template>
