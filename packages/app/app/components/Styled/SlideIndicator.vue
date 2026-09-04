<script setup lang="ts">
// Drop-in animated rail for any vertical list: place **one** inside a `position: relative` container
// Whose items each carry `data-slide-indicator-key="<key>"`. The bar measures the active
// Items and slides to span them — pass one key for a single highlight or several contiguous
// Keys (e.g. every heading currently on screen) to stretch across all of them.
//
// One per list, never one per section of it: a bar that is `v-if`-ed per group is destroyed and rebuilt as the
// Selection crosses a boundary, and the new one has no position to slide from, so every move starts at the top
// Of its own group. Sliding is only continuous while the same element survives the change.
interface Props {
  activeKeys: string[];
}

const { activeKeys } = defineProps<Props>();
const indicator = useTemplateRef("indicator");
const indicatorStyle = ref<{ height: string; transform: string; transitionDuration?: string }>();
// `isTracking` is a layout change moving the list under the bar — a group expanding, the drawer resizing — where
// The bar has to follow exactly. Sliding toward a target that moves every frame never settles and reads as a
// Stutter, so the slide is kept for the one thing it is for: the selection changing
const measure = (isTracking = false) => {
  const parent = indicator.value?.parentElement;
  if (!parent) return;
  const targets = activeKeys
    .map((activeKey) => parent.querySelector<HTMLElement>(`[data-slide-indicator-key="${activeKey}"]`))
    .filter((target) => target !== null);
  if (targets.length === 0) return;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const target of targets) {
    top = Math.min(top, target.offsetTop);
    bottom = Math.max(bottom, target.offsetTop + target.offsetHeight);
  }

  indicatorStyle.value = {
    height: `${bottom - top}px`,
    transform: `translateY(${top}px)`,
    transitionDuration: isTracking ? "0s" : undefined,
  };
};

useResizeObserver(
  () => indicator.value?.parentElement,
  () => {
    measure(true);
  },
);

// By value, not by identity: a caller handing over an equal-but-new array — a computed rebuilt from a set that
// Changed elsewhere, a literal in the binding — would otherwise cost a full remeasure for a selection that never
// Moved, and measuring reads layout
watch(
  () => JSON.stringify(activeKeys),
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
