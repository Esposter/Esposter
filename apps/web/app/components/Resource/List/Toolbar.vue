<script setup lang="ts">
import type { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import type { Item } from "@/models/shared/Item";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { RoutePath } from "@esposter/shared";

interface Props {
  source: ResourceListSource;
}

const { source } = defineProps<Props>();
const search = defineModel<string>("search", { required: true });
const isSummaryView = defineModel<boolean>("isSummaryView", { required: true });
const isGroupedByType = defineModel<boolean>("isGroupedByType", { required: true });
const emit = defineEmits<{ export: []; refresh: [] }>();
// The two views of the list are toggles that say whether they are on, so they stay out on every width; what is done
// Now and then waits in the overflow menu
const items = computed<Item[]>(() => [
  { meaning: UiIconMeaning.Download, onClick: () => emit("export"), title: "Export CSV" },
  { meaning: UiIconMeaning.Refresh, onClick: () => emit("refresh"), title: "Refresh" },
  {
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: async () => {
      await navigateTo(RoutePath.ResourceExplorerRecycleBin);
    },
    title: "Recycle bin",
  },
]);
</script>

<template>
  <div px-4 py-2 flex gap-2 items-center>
    <!-- The search takes the width the row has, since it is what the list is for -->
    <div flex-1 min-w-0>
      <UiTextField v-model="search" label="Search resources" :type="UiTextFieldType.Search" />
    </div>
    <UiIconButton
      :aria-pressed="isSummaryView"
      label="Summary view"
      :meaning="UiIconMeaning.Summary"
      :variant="UiButtonVariant.Quiet"
      @click="isSummaryView = !isSummaryView"
    />
    <UiIconButton
      :aria-pressed="isGroupedByType"
      label="Group by type"
      :meaning="UiIconMeaning.Group"
      :variant="UiButtonVariant.Quiet"
      @click="isGroupedByType = !isGroupedByType"
    />
    <ResourceListColumnChooserMenu :source />
    <UiOverflowMenu :items label="List actions" />
    <ResourceCloseButton />
  </div>
</template>
