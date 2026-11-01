<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { getEmojiDescription } from "@/services/message/emoji/getEmojiDescription";

interface Props {
  emoji: string;
}

const { emoji } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <UiTooltip :label="getEmojiDescription(emoji)">
    <template #default="{ activatorProps }">
      <UiButton
        :="activatorProps"
        :aria-label="`React with ${getEmojiDescription(emoji)}`"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="emit('select')"
      >
        {{ emoji }}
      </UiButton>
    </template>
    <template #content>
      <span text-center flex flex-col>
        <span>{{ getEmojiDescription(emoji) }}</span>
        <span text-sm text-muted>Click to react</span>
      </span>
    </template>
  </UiTooltip>
</template>
