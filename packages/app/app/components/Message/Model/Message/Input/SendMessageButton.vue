<script setup lang="ts">
interface SendMessageButtonProps {
  disabled?: boolean;
}

const { disabled } = defineProps<SendMessageButtonProps>();
const emit = defineEmits<{ click: [] }>();
const backgroundColor = computed(() => (disabled ? "transparent" : "currentColor"));
</script>

<template>
  <v-tooltip text="Send (Enter)">
    <template #activator="{ props: tooltipProps }">
      <v-btn icon="mdi-send" size="small" :disabled :="tooltipProps" @click="emit('click')" />
    </template>
  </v-tooltip>
</template>

<style scoped>
:deep(.v-btn__overlay) {
  background-color: v-bind(backgroundColor);
}
</style>
