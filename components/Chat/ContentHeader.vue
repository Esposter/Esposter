<script setup lang="ts">
interface ContentHeaderProps {
  leftDrawer: boolean;
  rightDrawer: boolean;
  openLeftDrawer: () => void;
  openRightDrawer: () => void;
}

const props = defineProps<ContentHeaderProps>();
const { leftDrawer, rightDrawer, openLeftDrawer, openRightDrawer } = toRefs(props);
const { border } = useColors();
</script>

<template>
  <v-toolbar class="v-app-bar border" height="56">
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

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border);
}
</style>
