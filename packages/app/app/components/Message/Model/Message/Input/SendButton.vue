<script setup lang="ts">
interface SendButtonProps {
  isLoading: boolean;
}

const { isLoading } = defineProps<SendButtonProps>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <v-tooltip text="Send (Enter)">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        icon="mdi-send"
        size="small"
        bg-transparent
        :disabled="isLoading"
        :loading="isLoading"
        :="tooltipProps"
        @click="emit('click')"
      />
    </template>
  </v-tooltip>
</template>
