<script setup lang="ts">
interface ContentHeaderProps {
  leftDrawer: boolean;
  rightDrawer: boolean;
  openLeftDrawer: () => void;
  openRightDrawer: () => void;
}

const props = defineProps<ContentHeaderProps>();
const { leftDrawer, rightDrawer, openLeftDrawer, openRightDrawer } = toRefs(props);
</script>

<template>
  <v-toolbar class="v-app-bar" tag="div" height="56" border>
    <template v-if="!leftDrawer" #prepend>
      <v-btn icon="mdi-menu" size="small" @click="openLeftDrawer" />
    </template>
    <ChatRoomTitle />
    <template #append>
      <v-btn icon="mdi-phone" size="small" />
      <v-btn icon="mdi-video" size="small" />
      <ChatAddMemberButton />
      <v-btn v-if="!rightDrawer" icon="mdi-account-multiple" size="small" @click="openRightDrawer" />
    </template>
  </v-toolbar>
</template>
