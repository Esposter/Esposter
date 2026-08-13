<script setup lang="ts">
interface PermissionListItemProps {
  permission: bigint;
  title: string;
}

const { permission, title } = defineProps<PermissionListItemProps>();
const modelValue = defineModel<bigint>({ required: true });
const isEnabled = computed(() => Boolean(modelValue.value & permission));
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
