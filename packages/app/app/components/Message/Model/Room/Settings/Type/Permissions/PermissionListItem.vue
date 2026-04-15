<script setup lang="ts">
interface PermissionListItemProps {
  permission: bigint;
  permissionKey: string;
}

const { permission, permissionKey } = defineProps<PermissionListItemProps>();
const modelValue = defineModel<bigint>({ required: true });
const isEnabled = computed(() => Boolean(modelValue.value & permission));
const formatLabel = (key: string) => key.replace(/([A-Z])/g, " $1").trim();
</script>

<template>
  <v-list-item :title="formatLabel(permissionKey)">
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
