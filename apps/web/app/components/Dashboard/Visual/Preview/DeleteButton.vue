<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useDashboardDialogStore } from "@/store/dashboard/dialog";
import { prettify } from "@/util/text/prettify";

interface Props {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<Props>();
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId } = storeToRefs(dashboardDialogStore);
const title = computed(() => `Delete ${prettify(type)} visual`);
</script>

<template>
  <UiIconButton
    :label="title"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="deletingVisualId = id"
  />
</template>
