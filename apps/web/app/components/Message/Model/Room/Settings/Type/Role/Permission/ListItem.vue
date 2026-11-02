<script setup lang="ts">
interface Props {
  description: string;
  permission: bigint;
  title: string;
}

const modelValue = defineModel<bigint>({ required: true });
const { description, permission, title } = defineProps<Props>();
</script>

<!-- A setting rather than a row of a list: the switch at the end is the only control on the row -->
<template>
  <MessageModelRoomSettingsTypeRolePermissionRow :description :title>
    <template #default="{ descriptionId }">
      <UiSwitch
        :aria-describedby="descriptionId"
        :label="title"
        :model-value="Boolean(modelValue & permission)"
        @update:model-value="modelValue = modelValue ^ permission"
      />
    </template>
  </MessageModelRoomSettingsTypeRolePermissionRow>
</template>
