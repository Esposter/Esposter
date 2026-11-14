<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { RoomReaction } from "@esposter/db-schema";

interface Props {
  emojis: RoomReaction[];
}

const modelValue = defineModel<string>({ required: true });
const { emojis } = defineProps<Props>();
// Each row is the emoji over its count, as Discord's rail has it. The emoji is the row's mark, drawn in its slot
const items = computed(() =>
  emojis.map<UiListItem<string>>(({ emojiTag, userIds }) => ({
    hasMarkSlot: true,
    title: String(userIds.length),
    value: emojiTag,
  })),
);
const selectedValues = computed(() => [modelValue.value]);
</script>

<template>
  <UiList
    :items
    label="Reactions"
    :model-value="selectedValues"
    shrink-0
    w-28
    @update:model-value="
      (value) => {
        const [emojiTag] = value ?? [];
        if (emojiTag) modelValue = emojiTag;
      }
    "
  >
    <template #mark="{ item }">
      <span ui-title><MessageModelMessageEmojiTag :emoji-tag="item.value" /></span>
    </template>
  </UiList>
</template>
