<script setup lang="ts">
interface PermissionListItemProps {
  permission: bigint;
  title: string;
}

const { permission, title } = defineProps<PermissionListItemProps>();
const modelValue = defineModel<bigint>({ required: true });
</script>

<template>
  <v-list-item :title>
    <template #append>
      <v-switch
        :model-value="Boolean(modelValue & permission)"
        density="compact"
        @update:model-value="modelValue = modelValue ^ permission"
      />
    </template>
  </v-list-item>
</template>
