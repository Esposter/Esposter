<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { PermissionOverrideState } from "@/models/message/room/role/PermissionOverrideState";

interface Props {
  description: string;
  // What the member's roles give for this permission, which the inherit segment says in full
  inheritedValue: boolean;
  title: string;
}

const { description, inheritedValue, title } = defineProps<Props>();
const modelValue = defineModel<PermissionOverrideState>({ required: true });
const descriptionId = useId();
const items = computed<UiMenuItem<PermissionOverrideState>[]>(() => [
  { title: "Deny", value: PermissionOverrideState.Deny },
  { title: inheritedValue ? "Inherit (allowed)" : "Inherit (denied)", value: PermissionOverrideState.Inherit },
  { title: "Allow", value: PermissionOverrideState.Allow },
]);
</script>

<!-- The three-state control the switch cannot carry: one segmented decision per row, the inherited answer named on
     the neutral segment so an inherit reads as what it resolves to -->
<template>
  <div py-2 flex gap-4 items-center>
    <div flex flex-1 flex-col min-w-0>
      <span>{{ title }}</span>
      <span :id="descriptionId" text-sm text-muted>{{ description }}</span>
    </div>
    <UiToggleGroup v-model="modelValue" :aria-describedby="descriptionId" :items :label="title" />
  </div>
</template>
