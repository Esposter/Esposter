<script setup lang="ts">
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";

interface Props {
  customEmojis?: CustomEmoji[];
  // The trigger's accessible name and its tooltip, and the panel's name
  label?: string;
  variant?: UiButtonVariant;
}
// What a call site passes goes to the trigger, which is the only element it can mean
defineOptions({ inheritAttrs: false });
defineSlots<{ footer?: () => VNode }>();
const isOpen = defineModel<boolean>("isOpen", { default: false });
const { customEmojis = [], label = EMOJI_PICKER_TOOLTIP_TEXT, variant = UiButtonVariant.Quiet } = defineProps<Props>();
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
// The panel mounts on the first open, which is what defers the emoji index to the first picker anyone opens, and
// Stays, so the index is built once however often the picker opens
const isPanelMounted = ref(false);

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) isPanelMounted.value = true;
});
</script>

<!-- One popover at every width, anchored to what it acts on: the panel sizes itself to the screen, so a phone needs no
     sheet of its own. Every trigger ends a row near the foot of what it acts on — the composer's toolbar, a message's
     hover bar, its reactions — so the panel opens above it toward the row's start, flipping below only where the top has
     no room -->
<template>
  <UiPopover v-model:is-open="isOpen" :="$attrs" :label position-area="top span-left" :variant px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Emoji" />
    </template>
    <!-- A pick closes the panel onto its trigger, where focus goes back -->
    <template #default="{ close }">
      <StyledEmojiPickerPanel
        v-if="isPanelMounted"
        :custom-emojis
        @select="
          (emojiTag: string, emoji: PickableEmoji) => {
            emit('select', emojiTag, emoji);
            close();
          }
        "
      >
        <template #footer><slot name="footer" /></template>
      </StyledEmojiPickerPanel>
    </template>
  </UiPopover>
</template>
