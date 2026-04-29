<script setup lang="ts">
import { normalizeString } from "@esposter/shared";

interface PermissionListItemProps {
  permission: bigint;
  permissionKey: string;
}

const { permission, permissionKey } = defineProps<PermissionListItemProps>();
const modelValue = defineModel<bigint>({ required: true });
const isEnabled = computed(() => Boolean(modelValue.value & permission));
const title = computed(() => normalizeString(permissionKey.replaceAll(/([A-Z])/g, " $1")));
</script>

<template>
  <v-list-item :title>
    <template #append>
      <v-switch
        :model-value="isEnabled"
        color="primary"
        density="compact"
        hide-details
        @update:model-value="modelValue = modelValue ^ permission"
      />
    </template>
  </v-list-item>
</template>
