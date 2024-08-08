<script setup lang="ts">
import type { WaypointState } from "vue-waypoint";

import { Going, Waypoint } from "vue-waypoint";

interface StyledWaypointProps {
  active: boolean;
}

const { active } = defineProps<StyledWaypointProps>();
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const loading = ref(false);
const realActive = computed(() => !loading.value && active);
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
            loading = true;
            emit('change', () => {
              loading = false;
            });
          }
        }
      "
    >
      <v-progress-circular v-if="loading" size="small" indeterminate />
    </Waypoint>
  </ClientOnly>
</template>
