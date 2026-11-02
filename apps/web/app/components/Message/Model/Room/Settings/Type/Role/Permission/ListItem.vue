<script setup lang="ts">
interface Props {
  description: string;
  // The reader could not save the role with this switch flipped, so it is held as the save would refuse it
  isDisabled?: true;
  permission: bigint;
  title: string;
}

const modelValue = defineModel<bigint>({ required: true });
const { description, isDisabled, permission, title } = defineProps<Props>();
</script>

<!-- A setting rather than a row of a list: the switch at the end is the only control on the row -->
<template>
  <MessageModelRoomSettingsTypeRolePermissionRow :description :title>
    <template #default="{ descriptionId }">
      <UiSwitch
        :aria-describedby="descriptionId"
        :disabled="isDisabled"
        :label="title"
        :model-value="Boolean(modelValue & permission)"
        @update:model-value="modelValue = modelValue ^ permission"
      />
    </template>
  </MessageModelRoomSettingsTypeRolePermissionRow>
</template>
