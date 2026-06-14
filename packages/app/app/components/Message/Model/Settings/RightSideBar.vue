<script setup lang="ts">
const emit = defineEmits<{ close: [event: MouseEvent] }>();
</script>

<template>
  <v-navigation-drawer :width="96" location="right" floating permanent>
    <div pt-10 flex justify-center>
      <v-btn icon="mdi-close" b-2 b-border b-solid @click="emit('close', $event)" />
    </div>
  </v-navigation-drawer>
</template>
