<script setup lang="ts">
// Drop-in animated rail for any vertical list: place inside a `position: relative` container
// Whose items each carry `data-slide-indicator-key="<key>"`. The bar measures the active
// Items and slides to span them — pass one key for a single highlight or several contiguous
// Keys (e.g. every heading currently on screen) to stretch across all of them.
interface StyledSlideIndicatorProps {
  activeKeys: string[];
}

const { activeKeys } = defineProps<StyledSlideIndicatorProps>();
const indicator = useTemplateRef("indicator");
const indicatorStyle = ref<{ height: string; transform: string }>();
const measure = () => {
  const parent = indicator.value?.parentElement;
  if (!parent) return;
  const targets = activeKeys
    .map((activeKey) => parent.querySelector<HTMLElement>(`[data-slide-indicator-key="${activeKey}"]`))
    .filter((target) => target !== null);
  if (targets.length === 0) return;
  const top = Math.min(...targets.map((target) => target.offsetTop));
  const bottom = Math.max(...targets.map((target) => target.offsetTop + target.offsetHeight));
  indicatorStyle.value = { height: `${bottom - top}px`, transform: `translateY(${top}px)` };
};

useResizeObserver(
  () => indicator.value?.parentElement,
  () => {
    measure();
  },
);

watch(
  () => activeKeys,
  async () => {
    await nextTick();
    measure();
  },
);

onMounted(() => {
  measure();
});
</script>

<template>
  <div
    ref="indicator"
    :style="indicatorStyle"
    rounded-r
    bg-primary
    w-1
    transition-all
    duration="[--transition-duration]"
    left-0
    top-0
    absolute
  />
</template>
