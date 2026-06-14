<script setup lang="ts">
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <StyledButton :button-props="{ text: 'Save Changes', variant: 'tonal' }" @click="emit('save')" />
</template>
