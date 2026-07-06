<script setup lang="ts">
import type { Document } from "@esposter/db-schema";

interface DocumentPickerProps {
  currentDocument: Document | undefined;
  documents: Document[];
}

const { currentDocument, documents } = defineProps<DocumentPickerProps>();
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
  <div flex items-center gap-2>
    <v-select
      hide-details
      item-title="name"
      item-value="id"
      label="Document"
      :items="documents"
      :model-value="currentDocument?.id"
      @update:model-value="emit('select', $event)"
    />
    <StyledTooltipIconButton
      icon="mdi-plus"
      text="New document"
      @click="
        {
          name = '';
          createDialog = true;
        }
      "
    />
    <StyledTooltipIconButton
      v-if="currentDocument"
      icon="mdi-pencil"
      text="Rename document"
      @click="
        {
          name = currentDocument.name;
          renameDialog = true;
        }
      "
    />
    <StyledTooltipIconButton
      v-if="currentDocument"
      icon="mdi-delete"
      text="Delete document"
      @click="deleteDialog = true"
    />
    <StyledDialog
      v-model="createDialog"
      :card-props="{ title: 'New document' }"
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
      :card-props="{ title: 'Rename document' }"
      :confirm-button-props="{ disabled: !name, text: 'Rename' }"
      @confirm="
        (onComplete) => {
          if (currentDocument) emit('rename', currentDocument.id, name);
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
      :card-props="{ title: `Delete ${currentDocument?.name}?` }"
      :confirm-button-props="{ color: 'error', text: 'Delete' }"
      @confirm="
        (onComplete) => {
          if (currentDocument) emit('delete', currentDocument.id);
          onComplete();
        }
      "
    >
      <v-card-text>This permanently deletes the document and its content.</v-card-text>
    </StyledDialog>
  </div>
</template>
