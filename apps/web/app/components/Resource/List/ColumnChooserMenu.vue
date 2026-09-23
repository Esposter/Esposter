<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  source: ResourceListSource;
}

const { source } = defineProps<Props>();
// Reads the same composable the table does rather than taking the column state as a model — one owner of
// Which columns exist, which are pinned, and which are hidden
const { hiddenColumnKeys, toggleableHeaders, toggleColumn } = useResourceListColumns(source);
</script>

<!-- A panel rather than a menu, since it stays open while several columns are shown or hidden -->
<template>
  <UiPopover label="Columns" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Columns" />
    </template>
    <UiCheckbox
      v-for="{ key, title } of toggleableHeaders"
      :key
      is-label-shown
      :label="title"
      :model-value="!hiddenColumnKeys.includes(key)"
      @update:model-value="toggleColumn(key)"
    />
  </UiPopover>
</template>
