<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar border color="surface" density="comfortable" :p="leftDrawerOpenAuto ? 'l-4' : undefined">
    <EsbabblerContentShowRoomListButton />
    <EsbabblerContentTitle />
    <template #append>
      <EsbabblerContentAddFriendsDialogButton />
      <EsbabblerContentShowMemberListButton />
    </template>
  </v-toolbar>
</template>
