<script setup lang="ts">
interface StyledSkeletonWaypointProps {
  active: boolean;
}

defineSlots<{ default: () => VNode }>();
const { active } = defineProps<StyledSkeletonWaypointProps>();
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const isLoading = ref(false);
const container = useTemplateRef("container");
const isVisible = useElementVisibility(container);

watchEffect(() => {
  if (!isVisible.value || !active || isLoading.value) return;
  isLoading.value = true;
  emit("change", () => {
    isLoading.value = false;
  });
});
</script>

<template>
  <div v-show="active" ref="container">
    <slot>
      <v-progress-circular v-if="isLoading" size="small" indeterminate />
    </slot>
  </div>
</template>
