<script setup lang="ts">
const { huddleParticipants, isHuddleActive, joinHuddle, leaveHuddle } = useHuddle();
const isInHuddle = computed(() => isHuddleActive.value || huddleParticipants.value.length > 0);
</script>

<template>
  <v-tooltip v-if="isHuddleActive" text="Leave Huddle">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="error" icon="mdi-phone-hangup" size="small" variant="tonal" @click="leaveHuddle" />
    </template>
  </v-tooltip>
  <v-tooltip v-else :text="isInHuddle ? 'Join Huddle' : 'Start Huddle'">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :color="isInHuddle ? 'primary' : undefined"
        :icon="isInHuddle ? 'mdi-account-multiple-plus' : 'mdi-headset'"
        :variant="isInHuddle ? 'tonal' : 'text'"
        size="small"
        @click="joinHuddle"
      />
    </template>
  </v-tooltip>
</template>
