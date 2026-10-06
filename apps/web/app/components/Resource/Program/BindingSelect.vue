<script setup lang="ts">
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";

interface Props {
  label: string;
  // Absent until the owner's resources of this type are read, since a binding cannot be told missing before then
  resources?: OffsetPaginationData<UiSelectItem<string>>;
}

const modelValue = defineModel<string>({ required: true });
const { label, resources } = defineProps<Props>();
const items = computed(() => [{ meaning: UiIconMeaning.None, title: "None", value: "" }, ...(resources?.items ?? [])]);
// A deleted or binned resource is gone from the owner's list while the program still holds its id, so the select
// Would show nothing at all — the binding is kept, and said to be missing where it is picked. Only a whole list can
// Say so: past the read cap, the bound one may be among those it left out
const isMissing = computed(() =>
  Boolean(
    resources &&
    !resources.hasMore &&
    modelValue.value &&
    !resources.items.some(({ value }) => value === modelValue.value),
  ),
);
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ label }}</span>
    <UiSelect v-model="modelValue" :items :label />
    <span v-if="isMissing" role="alert" text-sm text-error>{{ getMissingResourceMessage(label.toLowerCase()) }}</span>
  </div>
</template>
