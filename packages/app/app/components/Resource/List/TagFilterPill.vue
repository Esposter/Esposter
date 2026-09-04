<script setup lang="ts">
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH } from "@esposter/db-schema";

const tagName = defineModel<string>("tagName", { required: true });
const tagValue = defineModel<string>("tagValue", { required: true });
const emit = defineEmits<{ remove: [] }>();
const rules = useVRules();
// Both fields write query params the data table treats as its `search`, so they debounce like the search box
const { editedFilter: editedTagName } = useDebouncedFilter(tagName);
const { editedFilter: editedTagValue } = useDebouncedFilter(tagValue);
// Without a name there is nothing to match on, so the pill reads as unset until one is typed.
// A name with no value means "tagged with this at all", which is the common case.
// Reads the fields rather than the debounced filters so the chip keeps up with typing
const tagText = computed(() => {
  if (!editedTagName.value) return "all";
  return editedTagValue.value ? `${editedTagName.value}: ${editedTagValue.value}` : editedTagName.value;
});
const tagNameRules = computed(() => [rules.maxLength(MAX_TAG_NAME_LENGTH)]);
const tagValueRules = computed(() => [rules.maxLength(MAX_TAG_VALUE_LENGTH)]);
</script>

<template>
  <ResourceListFilterPill is-removable label="Tag" :value="tagText" @remove="emit('remove')">
    <v-card min-w-72>
      <v-card-text>
        <div flex flex-col gap-2>
          <v-text-field v-model="editedTagName" autofocus density="comfortable" label="Name" :rules="tagNameRules" />
          <v-text-field
            v-model="editedTagValue"
            density="comfortable"
            hint="Leave empty to match any value"
            label="Value"
            persistent-hint
            :rules="tagValueRules"
          />
        </div>
      </v-card-text>
    </v-card>
  </ResourceListFilterPill>
</template>
