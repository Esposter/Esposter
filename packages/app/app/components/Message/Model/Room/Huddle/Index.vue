<script setup lang="ts">
const { huddleUsers, isInHuddle } = useHuddle();
</script>

<template>
  <MessageModelRoomHuddleActive v-if="isInHuddle" />
  <MessageModelRoomHuddleBanner v-else-if="huddleUsers.length > 0" />
</template>
