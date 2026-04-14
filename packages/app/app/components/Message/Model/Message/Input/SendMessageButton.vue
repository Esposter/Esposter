<script setup lang="ts">
interface SendMessageButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

const { disabled, isLoading } = defineProps<SendMessageButtonProps>();
const emit = defineEmits<{ click: [] }>();
const backgroundColor = computed(() => (disabled ? "transparent" : "currentColor"));
</script>

<template>
  <v-tooltip text="Send (Enter)">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        icon="mdi-send"
        size="small"
        bg-transparent
        :disabled
        :loading="isLoading"
        :="tooltipProps"
        @click="emit('click')"
      />
    </template>
  </v-tooltip>
</template>

<style scoped lang="scss">
:deep(.v-btn__overlay) {
  background-color: v-bind(backgroundColor);
}
</style>
