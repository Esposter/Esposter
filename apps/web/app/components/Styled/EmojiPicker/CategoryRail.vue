<script setup lang="ts">
import type { EmojiCategory } from "@/models/message/emoji/EmojiCategory";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  categories: EmojiCategory[];
  isHorizontal?: true;
}

const modelValue = defineModel<string>({ required: true });
const { categories, isHorizontal } = defineProps<Props>();
</script>

<template>
  <!-- @TODO: a row of icon-only choices is a tab list or a toggle group that shows its titles as tooltips (ui-library,
    UiTabs and UiToggleGroup take an icon without its title), so meanwhile it is a group of toggles, the chosen one
    Pressed. Each is icon-only, so its title is its accessible name as well as its tooltip -->
  <div
    :class="isHorizontal ? 'of-x-auto' : 'flex-col of-y-auto'"
    aria-label="Categories"
    role="group"
    flex
    shrink-0
    gap-1
  >
    <UiTooltip v-for="{ icon, title } of categories" :key="title" :label="title">
      <template #default="{ activatorProps }">
        <UiButton
          :="activatorProps"
          :aria-label="title"
          :aria-pressed="title === modelValue"
          :variant="UiButtonVariant.Quiet"
          px-0
          @click="modelValue = title"
        >
          <span :class="icon" aria-hidden="true" size-6 />
        </UiButton>
      </template>
    </UiTooltip>
  </div>
</template>
