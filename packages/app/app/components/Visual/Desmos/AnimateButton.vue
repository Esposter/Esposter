<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <!-- Hardcode color="white" instead of vuetify's dark mode, since Desmos' colour inversion
   also applies to this button in dark mode. -->
  <StyledTooltipIconButton
    :button-props="{ class: 'rd bottom-2 left-1 fixed', color: 'white', size: 'small' }"
    icon="mdi-draw"
    text="Animate"
    :tooltip-props="{ location: 'right center' }"
    @click="emit('click', $event)"
  />
</template>
