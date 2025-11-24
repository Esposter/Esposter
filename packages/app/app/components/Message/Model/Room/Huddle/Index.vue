<script setup lang="ts">
const { huddleParticipants, isHuddleActive } = useHuddle();
const showBanner = computed(() => huddleParticipants.value.length > 0 && !isHuddleActive.value);
</script>

<template>
  <div>
    <MessageModelRoomHuddleBanner v-if="showBanner" />
    <MessageModelRoomHuddleActive v-if="isHuddleActive" />
  </div>
</template>
