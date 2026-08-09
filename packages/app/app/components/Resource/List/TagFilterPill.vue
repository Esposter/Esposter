<script setup lang="ts">
import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH } from "@esposter/db-schema";

const tagName = defineModel<string>("tagName", { required: true });
const tagValue = defineModel<string>("tagValue", { required: true });
const emit = defineEmits<{ remove: [] }>();
const rules = useVRules();
// Both fields write query params the data table treats as its `search`, so they debounce like the search box
const { input: tagNameInput } = useDebouncedFilter(tagName);
const { input: tagValueInput } = useDebouncedFilter(tagValue);
// Without a name there is nothing to match on, so the pill reads as unset until one is typed.
// A name with no value means "tagged with this at all", which is the common case.
// Reads the fields rather than the debounced filters so the chip keeps up with typing
const label = computed(() => {
  if (!tagNameInput.value) return "Tag == all";
  return tagValueInput.value ? `Tag == ${tagNameInput.value}: ${tagValueInput.value}` : `Tag == ${tagNameInput.value}`;
});
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-chip closable :="menuProps" @click:close="emit('remove')">{{ label }}</v-chip>
    </template>
    <v-card min-w-72>
      <v-card-text>
        <div flex flex-col gap-2>
          <v-text-field
            v-model="tagNameInput"
            autofocus
            density="comfortable"
            label="Name"
            :rules="[rules.maxLength(MAX_TAG_NAME_LENGTH)]"
          />
          <v-text-field
            v-model="tagValueInput"
            density="comfortable"
            hint="Leave empty to match any value"
            label="Value"
            persistent-hint
            :rules="[rules.maxLength(MAX_TAG_VALUE_LENGTH)]"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
