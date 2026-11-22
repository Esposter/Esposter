<script setup lang="ts">
interface Props {
  // The picture under the spoiler is held under a heavier blur in a message than in a composer's preview
  isHeavilyBlurred?: true | undefined;
}

defineProps<Props>();
</script>

<template>
  <div
    :class="isHeavilyBlurred ? 'backdrop-blur-md' : 'backdrop-blur-sm'"
    text-white
    text-center
    bg="media-overlay"
    flex
    pointer-events-none
    items-center
    inset-0
    justify-center
    absolute
  >
    SPOILER
  </div>
</template>
