<script setup lang="ts">
// Drop-in animated rail for any vertical list: place inside a `position: relative` container
// whose items each carry `data-slide-indicator-key="<key>"`. The bar measures the active
// item and slides to it. Reusable across sidebars — pass the active key, nothing else.
interface StyledSlideIndicatorProps {
  activeKey: string;
}

const { activeKey } = defineProps<StyledSlideIndicatorProps>();
const indicator = useTemplateRef("indicator");
const indicatorStyle = ref<{ height: string; transform: string }>();
const measure = () => {
  const parent = indicator.value?.parentElement;
  if (!parent) return;
  const target = parent.querySelector<HTMLElement>(`[data-slide-indicator-key="${activeKey}"]`);
  if (!target) return;
  indicatorStyle.value = { height: `${target.offsetHeight}px`, transform: `translateY(${target.offsetTop}px)` };
};

useResizeObserver(
  () => indicator.value?.parentElement,
  () => {
    measure();
  },
);

watch(
  () => activeKey,
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
    absolute
    left-0
    top-0
    w-1
    rounded-r
    bg-primary
    transition-transform
    duration-200
  />
</template>
