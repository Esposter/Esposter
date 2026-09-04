<script setup lang="ts">
interface Props {
  emojiTag: string;
}

const { emojiTag } = defineProps<Props>();
const { customEmoji, customEmojiId, description } = useEmojiTag(() => emojiTag);
</script>

<template>
  <NuxtImg v-if="customEmoji" :alt="description" :src="customEmoji.sasUrl" size-[1em] inline-block object-contain />
  <!-- The emoji this reaction names has been deleted. The reaction is still real and still counts, so it renders
       as a placeholder rather than disappearing or printing its own tag -->
  <v-icon v-else-if="customEmojiId" icon="mdi-image-broken-variant" size="small" :aria-label="description" />
  <template v-else>{{ emojiTag }}</template>
</template>
