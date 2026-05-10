<script setup lang="ts">
const emit = defineEmits<{ close: [event: MouseEvent] }>();
</script>

<template>
  <v-navigation-drawer :width="96" location="right" floating permanent>
    <div flex pt-10 justify-center>
      <v-btn icon="mdi-close" b-2 b-border @click="emit('close', $event)" />
    </div>
  </v-navigation-drawer>
</template>
