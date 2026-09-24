<script setup lang="ts">
interface Props {
  emojiTag: string;
}

const { emojiTag } = defineProps<Props>();
const { customEmoji, customEmojiId, description } = useEmojiTag(() => emojiTag);
</script>

<template>
  <NuxtImg v-if="customEmoji" :alt="description" :src="customEmoji.sasUrl" size="[1em]" inline-block object-contain />
  <!-- The emoji this reaction names has been deleted. The reaction is still real and still counts, so it renders
       as a placeholder rather than disappearing or printing its own tag -->
  <span
    v-else-if="customEmojiId"
    class="i-mdi:image-broken-variant"
    :aria-label="description"
    role="img"
    align-middle
    size-6
    inline-block
  />
  <template v-else>{{ emojiTag }}</template>
</template>
