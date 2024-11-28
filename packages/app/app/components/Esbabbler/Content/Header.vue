<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto, rightDrawerOpen } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar color="surface" density="comfortable" :p="leftDrawerOpenAuto ? 'l-4' : undefined" border>
    <v-btn v-if="!leftDrawerOpenAuto" icon="mdi-menu" size="small" @click="leftDrawerOpen = true" />
    <EsbabblerModelRoomTitle />
    <template #append>
      <EsbabblerModelMemberCreateDialogButton />
      <v-btn icon="mdi-account-multiple" size="small" @click="rightDrawerOpen = !rightDrawerOpen" />
    </template>
  </v-toolbar>
</template>
