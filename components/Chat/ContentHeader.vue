<script setup lang="ts">
import { useLayoutStore } from "@/store/useLayoutStore";
import { storeToRefs } from "pinia";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, rightDrawerOpen, leftDrawerOpenAuto, rightDrawerOpenAuto } = $(storeToRefs(layoutStore));
</script>

<template>
  <v-toolbar class="v-app-bar" height="56" :p="leftDrawerOpenAuto ? 'l-4' : undefined">
    <template v-if="!leftDrawerOpenAuto" #prepend>
      <v-btn icon="mdi-menu" size="small" @click="leftDrawerOpen = true" />
    </template>
    <ChatRoomTitle />
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
      <ChatAddMemberButton />
      <v-btn v-if="!rightDrawerOpenAuto" icon="mdi-account-multiple" size="small" @click="rightDrawerOpen = true" />
    </template>
  </v-toolbar>
</template>
