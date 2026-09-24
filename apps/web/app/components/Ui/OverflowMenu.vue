<script setup lang="ts">
import type { UiItem } from "@/models/ui/UiItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getUiMenuItems } from "@/services/ui/getUiMenuItems";

interface Props {
  items: UiItem[];
  // What the actions are of, such as "Post actions": the menu's name and its trigger's
  label: string;
  // The mark it opens from, where the actions are a kind of their own rather than one thing's: a sheet's data tools
  meaning?: UiIconMeaning;
}

// The actions of one thing behind one quiet mark: the same Item list its context menu opens, so the two never disagree
const isOpen = defineModel<boolean>("isOpen", { default: false });
const { items, label, meaning = UiIconMeaning.More } = defineProps<Props>();
</script>

<template>
  <UiMenu
    v-model:is-open="isOpen"
    :items="getUiMenuItems(items)"
    :label
    :variant="UiButtonVariant.Quiet"
    px-0
    @select="
      async (title, event) => {
        await items.find((item) => item.title === title)?.onClick?.(event);
      }
    "
  >
    <UiIcon :meaning />
  </UiMenu>
</template>
