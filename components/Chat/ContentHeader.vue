<script setup lang="ts">
import { useLayoutStore } from "@/store/useLayoutStore";
import { storeToRefs } from "pinia";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, rightDrawerOpen, leftDrawerOpenAuto, rightDrawerOpenAuto } = $(storeToRefs(layoutStore));
const { border } = useColors();
</script>

<template>
  <v-toolbar class="v-app-bar border" height="56">
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

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border);
}
</style>
