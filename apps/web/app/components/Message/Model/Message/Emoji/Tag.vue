<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  emojiTag: string;
}

const { emojiTag } = defineProps<Props>();
const { customEmoji, customEmojiId, description } = useEmojiTag(() => emojiTag);
</script>

<template>
  <NuxtImg
    v-if="customEmoji"
    :alt="description"
    :src="customEmoji.presignedUrl"
    size="[1em]"
    inline-block
    object-contain
  />
  <!-- The emoji this reaction names has been deleted. The reaction is still real and still counts, so it renders
       as a placeholder rather than disappearing or printing its own tag -->
  <UiIcon v-else-if="customEmojiId" :label="description" :meaning="UiIconMeaning.MissingImage" />
  <template v-else>{{ emojiTag }}</template>
</template>
