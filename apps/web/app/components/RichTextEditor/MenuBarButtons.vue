<script setup lang="ts">
import type { MenuItem } from "@/models/shared/MenuItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { checkIsDivider } from "@/services/shared/checkIsDivider";

interface Props {
  items: MenuItem[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <template v-for="(item, index) of items" :key="index">
    <div
      v-if="checkIsDivider(item)"
      aria-hidden="true"
      mx-1
      bg-divider
      shrink-0
      h-6
      w="[var(--ui-border-width)]"
      self-center
    />
    <UiTooltip v-else #default="{ activatorProps }" :label="item.title">
      <!-- A mark that says whether it is on, such as bold, is a toggle; one that only acts, such as undo, is not -->
      <UiButton
        :="activatorProps"
        :aria-label="item.title"
        :aria-pressed="item.active"
        :disabled="item.disabled"
        :variant="UiButtonVariant.Quiet"
        px-0
        @click="item.onClick?.($event)"
      >
        <span :class="item.icon" aria-hidden="true" align-middle size-6 inline-block />
      </UiButton>
    </UiTooltip>
  </template>
</template>
