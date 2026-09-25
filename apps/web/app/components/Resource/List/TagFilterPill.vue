<script setup lang="ts">
import { UiRules } from "@/services/ui/UiRules";
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH } from "@esposter/db-schema";

const tagName = defineModel<string>("tagName", { required: true });
const tagValue = defineModel<string>("tagValue", { required: true });
const emit = defineEmits<{ remove: [] }>();
// Both fields write query params the list reads by, so they debounce like the search box
const { editedFilter: editedTagName } = useDebouncedFilter(tagName);
const { editedFilter: editedTagValue } = useDebouncedFilter(tagValue);
// Without a name there is nothing to match on, so the pill reads as unset until one is typed.
// A name with no value means "tagged with this at all", which is the common case.
// Reads the fields rather than the debounced filters so the pill keeps up with typing
const tagText = computed(() => {
  if (editedTagName.value)
    return editedTagValue.value ? `${editedTagName.value}: ${editedTagValue.value}` : editedTagName.value;
  else return "all";
});
const tagNameRules = [UiRules.maxLength(MAX_TAG_NAME_LENGTH)];
const tagValueRules = [UiRules.maxLength(MAX_TAG_VALUE_LENGTH)];
</script>

<template>
  <ResourceListFilterPill is-removable label="Tag" :value="tagText" @remove="emit('remove')">
    <div flex flex-col gap-2 min-w-72>
      <UiTextField v-model="editedTagName" is-autofocus label="Name" :rules="tagNameRules" />
      <UiTextField v-model="editedTagValue" label="Value" :rules="tagValueRules" />
      <p text-muted>Leave the value empty to match any value.</p>
    </div>
  </ResourceListFilterPill>
</template>
