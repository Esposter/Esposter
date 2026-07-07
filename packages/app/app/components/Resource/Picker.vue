<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourcePickerProps {
  currentResource: Resource | undefined;
  resources: Resource[];
}

const { currentResource, resources } = defineProps<ResourcePickerProps>();
const emit = defineEmits<{
  create: [name: string];
  delete: [id: string];
  rename: [id: string, name: string];
  select: [id: string];
}>();
const createDialog = ref(false);
const renameDialog = ref(false);
const deleteDialog = ref(false);
const name = ref("");
</script>

<template>
  <div flex gap-2 items-center>
    <v-select
      hide-details
      item-title="name"
      item-value="id"
      label="Resource"
      max-width="20rem"
      min-width="12rem"
      prepend-inner-icon="mdi-folder-outline"
      :items="resources"
      :model-value="currentResource?.id"
      @update:model-value="emit('select', $event)"
    />
    <StyledTooltipIconButton
      icon="mdi-plus"
      text="New resource"
      @click="
        {
          name = '';
          createDialog = true;
        }
      "
    />
    <StyledTooltipIconButton
      v-if="currentResource"
      icon="mdi-pencil"
      text="Rename resource"
      @click="
        {
          name = currentResource.name;
          renameDialog = true;
        }
      "
    />
    <StyledTooltipIconButton
      v-if="currentResource"
      icon="mdi-delete"
      text="Delete resource"
      @click="deleteDialog = true"
    />
    <StyledDialog
      v-model="createDialog"
      :card-props="{ title: 'New resource' }"
      :confirm-button-props="{ disabled: !name, text: 'Create' }"
      @confirm="
        (onComplete) => {
          emit('create', name);
          onComplete();
        }
      "
    >
      <v-card-text>
        <v-text-field v-model="name" label="Name" />
      </v-card-text>
    </StyledDialog>
    <StyledDialog
      v-model="renameDialog"
      :card-props="{ title: 'Rename resource' }"
      :confirm-button-props="{ disabled: !name, text: 'Rename' }"
      @confirm="
        (onComplete) => {
          if (currentResource) emit('rename', currentResource.id, name);
          onComplete();
        }
      "
    >
      <v-card-text>
        <v-text-field v-model="name" label="Name" />
      </v-card-text>
    </StyledDialog>
    <StyledDialog
      v-model="deleteDialog"
      :card-props="{ title: `Delete ${currentResource?.name}?` }"
      :confirm-button-props="{ color: 'error', text: 'Delete' }"
      @confirm="
        (onComplete) => {
          if (currentResource) emit('delete', currentResource.id);
          onComplete();
        }
      "
    >
      <v-card-text>This permanently deletes the resource and its content.</v-card-text>
    </StyledDialog>
  </div>
</template>
