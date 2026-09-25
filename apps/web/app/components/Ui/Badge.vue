<script setup lang="ts">
interface Props {
  count: number;
  // The accessible name, for a count nothing beside it says: "3 mentions". Without one it is decoration, as the count
  // An activator's own name already reads is
  label?: string;
}

// How many of something wait on what it sits beside — unread notifications, a room's mentions — filled in the danger
// Colour. Never narrower than it is tall, so one digit reads as a round mark and more digits widen it rather than
// Squeezing into it, and it never shrinks in a row that runs short
const { count, label } = defineProps<Props>();
</script>

<template>
  <span
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    text-sm
    text-background
    px-1
    bg-error
    inline-flex
    shrink-0
    h-5
    min-w-5
    text-nowrap
    items-center
    justify-center
    ui-pill
  >
    {{ count }}
  </span>
</template>
