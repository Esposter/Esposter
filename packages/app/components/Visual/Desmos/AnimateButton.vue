<script setup lang="ts">
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <v-tooltip location="right center" text="Animate">
    <template #activator="{ props }">
      <!-- @vue-ignore @TODO: Remove this when typescript + vue-tsc is fixed... some day. -->
      <v-btn
        fixed="!"
        bottom-2
        left-1
        rd-1="!"
        icon="mdi-draw"
        size="small"
        color="surface"
        :="props"
        @click="(event) => emit('click', event)"
      />
    </template>
  </v-tooltip>
</template>
