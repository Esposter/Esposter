<script setup lang="ts">
import type { ResourceTags } from "@esposter/db-schema";

import { getResourceTags } from "@/services/resource/tag/getResourceTags";
import { getTagRows } from "@/services/resource/tag/getTagRows";
import { tagNameRules } from "@/services/resource/tag/tagNameRules";
import { tagValueRules } from "@/services/resource/tag/tagValueRules";
import { MAX_TAGS_COUNT } from "@esposter/db-schema";

interface ResourceTagsEditorDialogProps {
  tags: ResourceTags;
  updateTags: (tags: ResourceTags) => Promise<void>;
}

const isOpen = defineModel<boolean>({ default: false });
const { tags, updateTags } = defineProps<ResourceTagsEditorDialogProps>();
// The caller mounts this only while it is open, so the rows start from the current tags on every open.
// An empty trailing row means the first thing the user sees is somewhere to type.
const rows = ref(tags && Object.keys(tags).length > 0 ? getTagRows(tags) : [{ name: "", value: "" }]);
const canAddRow = computed(() => rows.value.length < MAX_TAGS_COUNT);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Edit tags' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      async (_event, onComplete) => {
        await updateTags(getResourceTags(rows));
        onComplete();
      }
    "
  >
    <div flex flex-col gap-2>
      <div v-for="(row, index) of rows" :key="index" flex gap-2 items-start>
        <v-text-field v-model="row.name" density="comfortable" label="Name" :rules="tagNameRules" />
        <v-text-field v-model="row.value" density="comfortable" label="Value" :rules="tagValueRules" />
        <StyledTooltipIconButton icon="mdi-delete" text="Remove tag" @click="rows.splice(index, 1)" />
      </div>
      <v-btn v-if="canAddRow" prepend-icon="mdi-plus" variant="text" w-fit @click="rows.push({ name: '', value: '' })">
        Add tag
      </v-btn>
      <span v-else op-medium-emphasis text-caption>A resource can have at most {{ MAX_TAGS_COUNT }} tags.</span>
    </div>
  </StyledFormDialog>
</template>
