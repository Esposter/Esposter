<script setup lang="ts">
import { Going, Waypoint } from "vue-waypoint";
// @NOTE Volar needs to fix detecting type usage
import type { WaypointState } from "vue-waypoint";

interface WaypointProps {
  active: boolean;
}

const props = defineProps<WaypointProps>();
const active = toRef(props, "active");
const emit = defineEmits<{ (event: "change", finishLoading: () => void): void }>();
const loading = ref(false);
const realActive = computed(() => !loading.value && active.value);
</script>

<template>
  <ClientOnly>
    <Waypoint
      display="flex"
      justify="center"
      :active="realActive"
      @change="(waypointState: WaypointState) => {
        if (waypointState.going === Going.In) {
          loading = true;
          emit('change', () => {
            loading = false;
          });
        }
      }"
    >
      <v-progress-circular v-if="loading" size="small" indeterminate />
    </Waypoint>
  </ClientOnly>
</template>
