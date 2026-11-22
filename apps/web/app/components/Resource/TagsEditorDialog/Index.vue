<script setup lang="ts">
import type { TagRow } from "#src/models/resource/TagRow";
import type { ResourceTags } from "@esposter/db-schema";

import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getResourceTags } from "#src/services/resource/tag/getResourceTags";
import { getTagRows } from "#src/services/resource/tag/getTagRows";
import { MAX_TAGS_COUNT } from "@esposter/db-schema";
import { v7 } from "uuid";

interface Props {
  tags: ResourceTags;
  updateTags: (tags: ResourceTags) => void;
}

const isOpen = defineModel<boolean>({ default: false });
const { tags } = defineProps<Props>();
// The caller mounts this only while it is open, so the rows start from the current tags on every open.
// An empty trailing row means the first thing the user sees is somewhere to type.
// A row is keyed by its own id rather than its place, so removing one leaves each remaining row's field, and the error
// Its field shows, with the row it belongs to
const createRow = (row: TagRow = { name: "", value: "" }) => Object.assign(structuredClone(row), { id: v7() });
const rows = ref(Object.keys(tags).length > 0 ? getTagRows(tags).map((row) => createRow(row)) : [createRow()]);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Save"
    :submit="() => updateTags(getResourceTags(rows))"
    title="Edit tags"
    :size="UiDialogSize.Large"
  >
    <ResourceTagsEditorDialogRow
      v-for="(row, index) of rows"
      :key="row.id"
      v-model:name="row.name"
      v-model:value="row.value"
      @remove="rows = rows.toSpliced(index, 1)"
    />
    <UiButton v-if="rows.length < MAX_TAGS_COUNT" self-start @click="rows = [...rows, createRow()]">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add tag
    </UiButton>
    <p v-else text-muted>A resource can have at most {{ MAX_TAGS_COUNT }} tags.</p>
  </StyledFormDialog>
</template>
