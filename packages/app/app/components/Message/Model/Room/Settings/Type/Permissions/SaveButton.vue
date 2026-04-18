<script setup lang="ts">
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <v-btn color="primary" variant="tonal" @click="emit('save')">Save Changes</v-btn>
</template>
