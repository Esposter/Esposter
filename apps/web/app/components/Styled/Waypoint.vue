<script setup lang="ts">
interface Props {
  isActive: boolean;
}

defineSlots<{ default: () => VNode }>();
const { isActive } = defineProps<Props>();
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const isLoading = ref(false);
const container = useTemplateRef("container");
// The observer stays alive for the component's life on purpose. `v-show` already hides an exhausted waypoint,
// So an IntersectionObserver on a `display: none` element reports not-intersecting and never fires again —
// Tearing it down on `isActive` would buy nothing and cost the re-observation race on the way back
const isVisible = useElementVisibility(container);

watch([isVisible, () => isActive, isLoading], ([newIsVisible, newIsActive, newIsLoading]) => {
  if (!newIsVisible || !newIsActive || newIsLoading) return;
  isLoading.value = true;
  emit("change", () => {
    isLoading.value = false;
  });
});
</script>

<template>
  <div v-show="isActive" ref="container">
    <slot>
      <v-progress-circular v-if="isLoading" size="small" indeterminate />
    </slot>
  </div>
</template>
