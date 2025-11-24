<script setup lang="ts">
const { joinHuddle } = useHuddle();
</script>

<template>
  <div flex items-center justify-between bg-surface-variant px-4 py-2>
    <div flex items-center>
      <v-icon icon="mdi-headset" mr-2 />
      <span font-bold>Huddle in progress</span>
    </div>
    <v-btn color="primary" size="small" variant="text" @click="joinHuddle">Join</v-btn>
  </div>
</template>
