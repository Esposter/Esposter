<script setup lang="ts">
import type { ResourceTags } from "@esposter/db-schema";

import { getResourceTags } from "@/services/resource/tag/getResourceTags";
import { getTagRows } from "@/services/resource/tag/getTagRows";
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH, MAX_TAGS_COUNT } from "@esposter/db-schema";

interface Props {
  tags: ResourceTags;
  updateTags: (tags: ResourceTags) => Promise<void>;
}

const isOpen = defineModel<boolean>({ default: false });
const { tags, updateTags } = defineProps<Props>();
const rules = useVRules();
const nameRules = computed(() => [rules.maxLength(MAX_TAG_NAME_LENGTH)]);
const valueRules = computed(() => [rules.maxLength(MAX_TAG_VALUE_LENGTH)]);
// The caller mounts this only while it is open, so the rows start from the current tags on every open.
// An empty trailing row means the first thing the user sees is somewhere to type.
const rows = ref(tags && Object.keys(tags).length > 0 ? getTagRows(tags) : [{ name: "", value: "" }]);
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
        <v-text-field v-model="row.name" density="comfortable" label="Name" :rules="nameRules" />
        <v-text-field v-model="row.value" density="comfortable" label="Value" :rules="valueRules" />
        <StyledTooltipIconButton icon="mdi-delete" text="Remove tag" @click="rows = rows.toSpliced(index, 1)" />
      </div>
      <!-- Same reason as the Edit button that opens this dialog: transparent, it reads as a caption rather
           than as the control that adds a row -->
      <StyledButton
        v-if="rows.length < MAX_TAGS_COUNT"
        :button-props="{ prependIcon: 'mdi-plus', size: 'small', text: 'Add tag' }"
        w-fit
        @click="rows.push({ name: '', value: '' })"
      />
      <span v-else text-caption op-medium-emphasis>A resource can have at most {{ MAX_TAGS_COUNT }} tags.</span>
    </div>
  </StyledFormDialog>
</template>
