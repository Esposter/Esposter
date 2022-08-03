<script setup lang="ts">
interface ContentProps {
  leftDrawer: boolean;
  rightDrawer: boolean;
  openLeftDrawer: () => void;
  openRightDrawer: () => void;
}

const props = defineProps<ContentProps>();
</script>

<template>
  <div display="flex" flex="col" h="full">
    <ChatContentHeader :="props" />
    <ChatMessageList />
  </div>
</template>
