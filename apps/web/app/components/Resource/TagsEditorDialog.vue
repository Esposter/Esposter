<script setup lang="ts">
import type { TagRow } from "@/models/resource/TagRow";
import type { ResourceTags } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getResourceTags } from "@/services/resource/tag/getResourceTags";
import { getTagRows } from "@/services/resource/tag/getTagRows";
import { UiRules } from "@/services/ui/UiRules";
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH, MAX_TAGS_COUNT } from "@esposter/db-schema";
import { v7 } from "uuid";

interface Props {
  tags: ResourceTags;
  updateTags: (tags: ResourceTags) => Promise<void>;
}

const isOpen = defineModel<boolean>({ default: false });
const { tags } = defineProps<Props>();
const nameRules = [UiRules.maxLength(MAX_TAG_NAME_LENGTH)];
const valueRules = [UiRules.maxLength(MAX_TAG_VALUE_LENGTH)];
// The caller mounts this only while it is open, so the rows start from the current tags on every open.
// An empty trailing row means the first thing the user sees is somewhere to type.
// A row is keyed by its own id rather than its place, so removing one leaves each remaining row's field, and the error
// Its field shows, with the row it belongs to
const createRow = (row: TagRow = { name: "", value: "" }) => ({ ...row, id: v7() });
const rows = ref(Object.keys(tags).length > 0 ? getTagRows(tags).map((row) => createRow(row)) : [createRow()]);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Save"
    is-optimistic
    :submit="() => updateTags(getResourceTags(rows))"
    title="Edit tags"
    :size="UiDialogSize.Large"
  >
    <div v-for="(row, index) of rows" :key="row.id" flex gap-2 items-end>
      <UiTextField v-model="row.name" label="Name" :rules="nameRules" flex-1 />
      <UiTextField v-model="row.value" label="Value" :rules="valueRules" flex-1 />
      <UiIconButton
        label="Remove tag"
        :meaning="UiIconMeaning.Delete"
        :variant="UiButtonVariant.Quiet"
        @click="rows = rows.toSpliced(index, 1)"
      />
    </div>
    <UiButton v-if="rows.length < MAX_TAGS_COUNT" self-start @click="rows = [...rows, createRow()]">
      <UiIcon :meaning="UiIconMeaning.Create" />
      Add tag
    </UiButton>
    <p v-else text-muted>A resource can have at most {{ MAX_TAGS_COUNT }} tags.</p>
  </StyledFormDialog>
</template>
