<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar :pl="leftDrawerOpenAuto ? '4' : undefined" b-none density="comfortable">
    <EsbabblerContentShowRoomListButton />
    <EsbabblerContentTitle />
    <template #append>
      <EsbabblerContentAddFriendsDialogButton />
      <EsbabblerContentShowMemberListButton />
    </template>
  </v-toolbar>
</template>
