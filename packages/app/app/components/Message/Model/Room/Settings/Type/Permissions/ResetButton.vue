<script setup lang="ts">
const emit = defineEmits<{ reset: [] }>();
</script>

<template>
  <v-btn variant="plain" @click="emit('reset')">Reset</v-btn>
</template>
