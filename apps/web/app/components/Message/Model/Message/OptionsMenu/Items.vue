<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  items: Item[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <!-- @TODO: the actions name whole icon classes until they name meanings (ui-library, UiIconMap), so each is a
    Tooltip over a button rather than an icon button -->
  <UiTooltip v-for="{ icon, shortTitle, title, onClick } of items" :key="title" :label="shortTitle ?? title">
    <template #default="{ activatorProps }">
      <UiButton
        :="activatorProps"
        :aria-label="shortTitle ?? title"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="onClick?.($event)"
      >
        <span :class="icon" aria-hidden="true" size-6 />
      </UiButton>
    </template>
  </UiTooltip>
</template>
