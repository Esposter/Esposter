<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  items: Extract<Item, { meaning: UiIconMeaning }>[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <UiIconButton
    v-for="{ meaning, shortTitle, title, onClick } of items"
    :key="title"
    :label="shortTitle ?? title"
    :meaning
    :variant="UiButtonVariant.Quiet"
    @click="onClick?.($event)"
  />
</template>
