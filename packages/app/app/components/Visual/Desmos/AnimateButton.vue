<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip location="right center" text="Animate">
    <template #activator="{ props }">
      <!-- Hardcode color="white" instead of vuetify's dark mode, since Desmos' colour inversion
       also applies to this button in dark mode. -->
      <v-btn
        color="white"
        icon="mdi-draw"
        size="small"
        rd
        bottom-2
        left-1
        fixed
        :="props"
        @click="emit('click', $event)"
      />
    </template>
  </v-tooltip>
</template>
