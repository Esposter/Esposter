<script setup lang="ts">
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { EMOJI_PICKER_TOOLTIP_TEXT } from "@/services/styled/constants";
import { mergeProps } from "vue";

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
// A phone has no room beside its trigger for a panel this size, and a panel anchored to a button near the screen edge
// Is pushed back into the viewport wherever it fits, so there the same panel is a sheet up from the bottom edge
const { smAndDown } = useVDisplay();
// The panel mounts on the first open, which is what defers the emoji index to the first picker anyone opens, and
// Stays, so the index is built once however often the picker opens
const isPanelMounted = ref(false);

watch(isOpen, (newIsOpen) => {
  if (newIsOpen) isPanelMounted.value = true;
});
</script>

<template>
  <template v-if="smAndDown">
    <UiTooltip #default="{ activatorProps }" :label>
      <UiButton
        :="mergeProps(activatorProps, $attrs)"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        :aria-label="label"
        :variant
        px-0
        @click="isOpen = true"
      >
        <span class="i-mdi:emoticon-outline" aria-hidden="true" size-6 />
      </UiButton>
    </UiTooltip>
    <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Sheet" :title="label">
      <StyledEmojiPickerPanel
        v-if="isPanelMounted"
        :custom-emojis
        is-sheet
        @select="
          (emojiTag: string, emoji: PickableEmoji) => {
            emit('select', emojiTag, emoji);
            isOpen = false;
          }
        "
      >
        <template #footer><slot name="footer" /></template>
      </StyledEmojiPickerPanel>
    </UiDialog>
  </template>
  <UiPopover v-else v-model:is-open="isOpen" :="$attrs" :label :variant px-0>
    <template #trigger>
      <span class="i-mdi:emoticon-outline" aria-hidden="true" size-6 />
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
