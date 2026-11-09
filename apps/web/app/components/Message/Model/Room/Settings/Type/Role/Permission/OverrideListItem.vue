<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { PermissionOverrideState } from "@/models/message/room/role/PermissionOverrideState";

interface Props {
  description: string;
  // What the member's roles give for this permission, which the inherit segment says in full
  inheritedValue: boolean;
  // The reader does not hold the permission, and the server refuses an allow of one they lack, so the segment is held
  // Unless the row already allows it, since that is the one state the reader can move away from
  isAllowDisabled?: true;
  // A member the reader cannot manage, who no write to their row is accepted for, so every segment is held
  isDisabled?: true;
  title: string;
}

const modelValue = defineModel<PermissionOverrideState>({ required: true });
const { inheritedValue, isAllowDisabled, isDisabled } = defineProps<Props>();
const items = computed<UiMenuItem<PermissionOverrideState>[]>(() => [
  { isDisabled, title: "Deny", value: PermissionOverrideState.Deny },
  {
    isDisabled,
    title: inheritedValue ? "Inherit (allowed)" : "Inherit (denied)",
    value: PermissionOverrideState.Inherit,
  },
  {
    isDisabled: isDisabled || (isAllowDisabled && modelValue.value !== PermissionOverrideState.Allow),
    title: "Allow",
    value: PermissionOverrideState.Allow,
  },
]);
</script>

<!-- The three-state control the switch cannot carry: one segmented decision per row, the inherited answer named on
     the neutral segment so an inherit reads as what it resolves to -->
<template>
  <MessageModelRoomSettingsTypeRolePermissionRow :description :title>
    <template #default="{ descriptionId }">
      <UiToggleGroup v-model="modelValue" :aria-describedby="descriptionId" :items :label="title" />
    </template>
  </MessageModelRoomSettingsTypeRolePermissionRow>
</template>
