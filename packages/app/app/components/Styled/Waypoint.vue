<script setup lang="ts">
import type { WaypointState } from "vue-waypoint";

import { Going, Waypoint } from "vue-waypoint";

interface StyledWaypointProps {
  active: boolean;
}

const { active } = defineProps<StyledWaypointProps>();
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const isLoading = ref(false);
const realActive = computed(() => !isLoading.value && active);
</script>

<template>
  <ClientOnly>
    <Waypoint
      flex
      justify-center
      :active="realActive"
      @change="
        (waypointState: WaypointState) => {
          if (waypointState.going === Going.In) {
            isLoading = true;
            emit('change', () => {
              isLoading = false;
            });
          }
        }
      "
    >
      <v-progress-circular v-if="isLoading" size="small" indeterminate />
    </Waypoint>
  </ClientOnly>
</template>
