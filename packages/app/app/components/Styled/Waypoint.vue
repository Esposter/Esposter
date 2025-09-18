<script setup lang="ts">
interface StyledWaypointProps {
  isActive: boolean;
}

defineSlots<{ default: () => VNode }>();
const { isActive } = defineProps<StyledWaypointProps>();
const emit = defineEmits<{ change: [onComplete: () => void] }>();
const isLoading = ref(false);
const container = useTemplateRef("container");
const isVisible = useElementVisibility(container);

watchEffect(() => {
  if (!isVisible.value || !isActive || isLoading.value) return;
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
