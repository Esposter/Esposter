<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip location="right center" text="Animate">
    <template #activator="{ props }">
      <!-- We actually want to ignore vuetify's dark mode and hardcode color="white"
       as Desmos' invert colors will also apply to this button when we use dark mode -->
      <!-- @vue-ignore @TODO: Remove this when typescript + vue-tsc is fixed... some day. -->
      <v-btn
        fixed="!"
        bottom-2
        left-1
        rd-1="!"
        icon="mdi-draw"
        size="small"
        color="white"
        :="props"
        @click="(event) => emit('click', event)"
      />
    </template>
  </v-tooltip>
</template>
