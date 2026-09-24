<script setup lang="ts">
import type { ResourceTags } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
const isValid = ref(true);
const rows = ref(Object.keys(tags).length > 0 ? getTagRows(tags) : [{ name: "", value: "" }]);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Edit tags" w="[min(40rem,90vw)]">
    <UiForm
      v-model:is-valid="isValid"
      p-3
      flex
      flex-col
      gap-3
      @submit="
        async () => {
          await updateTags(getResourceTags(rows));
          isOpen = false;
        }
      "
    >
      <div v-for="(row, index) of rows" :key="index" flex gap-2 items-end>
        <UiTextField v-model="row.name" label="Name" :rules="nameRules" flex-1 />
        <UiTextField v-model="row.value" label="Value" :rules="valueRules" flex-1 />
        <UiIconButton
          label="Remove tag"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="rows = rows.toSpliced(index, 1)"
        />
      </div>
      <UiButton v-if="rows.length < MAX_TAGS_COUNT" self-start @click="rows = [...rows, { name: '', value: '' }]">
        <UiIcon :meaning="UiIconMeaning.Create" />
        Add tag
      </UiButton>
      <p v-else text-muted>A resource can have at most {{ MAX_TAGS_COUNT }} tags.</p>
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
