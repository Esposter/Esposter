<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

const { disabled } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
const backgroundColor = computed(() => (disabled ? "transparent" : "currentColor"));
</script>

<template>
  <StyledTooltipIconButton
    icon="mdi-send"
    text="Send (Enter)"
    :button-props="{ disabled, size: 'small' }"
    @click="emit('click')"
  />
</template>

<style scoped>
/* The button is disabled while the composer has nothing to send, and Vuetify's disabled overlay is what would
   otherwise grey the icon out — the send affordance reads as absent rather than as unavailable */
:deep(.v-btn__overlay) {
  background-color: v-bind(backgroundColor);
}
</style>
