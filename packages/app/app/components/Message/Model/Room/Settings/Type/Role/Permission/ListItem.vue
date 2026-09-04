<script setup lang="ts">
interface RolePermissionListItemProps {
  description: string;
  permission: bigint;
  title: string;
}

const { description, permission, title } = defineProps<RolePermissionListItemProps>();
const modelValue = defineModel<bigint>({ required: true });
</script>

<!-- The description is the row's own content rather than a `subtitle`, which Vuetify clamps to one line — the
     sentence is the only thing on the row a reader does not already know from the permission's name -->
<template>
  <v-list-item>
    <v-list-item-title>{{ title }}</v-list-item-title>
    <div op-medium-emphasis text-body-small>{{ description }}</div>
    <template #append>
      <v-switch
        :model-value="Boolean(modelValue & permission)"
        density="compact"
        @update:model-value="modelValue = modelValue ^ permission"
      />
    </template>
  </v-list-item>
</template>
