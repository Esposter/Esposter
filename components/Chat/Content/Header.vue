<script setup lang="ts">
import { useLayoutStore } from "@/store/useLayoutStore";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, rightDrawerOpen, leftDrawerOpenAuto, rightDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <v-toolbar class="v-app-bar" height="56" :p="leftDrawerOpenAuto ? 'l-4' : undefined" border>
    <v-btn v-if="!leftDrawerOpenAuto" icon="mdi-menu" size="small" @click="leftDrawerOpen = true" />
    <ChatModelRoomTitle />
    <template #append>
      <ChatModelMemberCreateDialogButton />
      <v-btn v-if="!rightDrawerOpenAuto" icon="mdi-account-multiple" size="small" @click="rightDrawerOpen = true" />
    </template>
  </v-toolbar>
</template>
