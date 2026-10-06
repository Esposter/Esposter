<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";

interface Props {
  label: string;
  // Absent until the owner's resources of this type are read, since a binding cannot be told missing before then
  resources?: UiSelectItem<string>[];
}

const modelValue = defineModel<string>({ required: true });
const { label, resources } = defineProps<Props>();
const items = computed(() => [{ meaning: UiIconMeaning.None, title: "None", value: "" }, ...(resources ?? [])]);
// A deleted or binned resource is gone from the owner's list while the program still holds its id, so the select
// Would show nothing at all — the binding is kept, and said to be missing where it is picked
const isMissing = computed(() =>
  Boolean(resources && modelValue.value && !resources.some(({ value }) => value === modelValue.value)),
);
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ label }}</span>
    <UiSelect v-model="modelValue" :items :label />
    <span v-if="isMissing" role="alert" text-sm text-error>{{ getMissingResourceMessage(label.toLowerCase()) }}</span>
  </div>
</template>
