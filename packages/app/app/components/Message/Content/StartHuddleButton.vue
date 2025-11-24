<script setup lang="ts">
const { huddleUsers, isInHuddle, joinHuddle, leaveHuddle } = useHuddle();
</script>

<template>
  <v-tooltip v-if="isInHuddle" text="Leave Huddle">
    <template #activator="{ props }">
      <v-btn v-bind="props" color="error" icon="mdi-phone-hangup" size="small" variant="tonal" @click="leaveHuddle" />
    </template>
  </v-tooltip>
  <v-tooltip v-else :text="huddleUsers.length > 0 ? 'Join Huddle' : 'Start Huddle'">
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
