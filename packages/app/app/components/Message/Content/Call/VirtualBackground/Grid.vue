<script setup lang="ts">
import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";

interface CallVirtualBackgroundGridProps {
  selectedVirtualBackground: string;
}

const { selectedVirtualBackground } = defineProps<CallVirtualBackgroundGridProps>();
const emit = defineEmits<{ select: [imagePath: string] }>();
</script>

<template>
  <v-list density="compact">
    <v-list-subheader title="Backgrounds and effects" />
    <div px-3 pb-2 gap-2 grid grid-cols-5>
      <button
        v-for="{ imagePath, title } of CallVirtualBackgroundDefinitions"
        :key="title"
        :aria-label="title"
        :style="{ backgroundImage: imagePath ? `url(${imagePath})` : undefined }"
        b-2
        rd
        b-solid
        bg-surface
        aspect-square
        bg-cover
        bg-center
        :class="selectedVirtualBackground === imagePath ? 'b-primary' : 'b-transparent'"
        @click="emit('select', imagePath)"
      >
        <v-icon v-if="!imagePath" icon="mdi-close" size="small" />
      </button>
    </div>
  </v-list>
</template>
