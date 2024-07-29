<script setup lang="ts">
import { useColors } from "@/composables/useColors";

const emit = defineEmits<{ click: [event: MouseEvent] }>();
const { surface } = useColors();
</script>

<template>
  <v-tooltip location="right center" text="Animate">
    <template #activator="{ props }">
      <!-- @vue-ignore @TODO: Remove this when typescript + vue-tsc is fixed... some day. -->
      <v-btn
        :style="{ backgroundColor: surface }"
        fixed="!"
        bottom-2
        left-1
        rd-1="!"
        icon="mdi-draw"
        size="small"
        :="props"
        @click="(event) => emit('click', event)"
      />
    </template>
  </v-tooltip>
</template>
