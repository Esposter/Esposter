<script setup lang="ts">
import { tagNameRules } from "@/services/resource/tag/tagNameRules";
import { tagValueRules } from "@/services/resource/tag/tagValueRules";

const tagName = defineModel<string>("tagName", { required: true });
const tagValue = defineModel<string>("tagValue", { required: true });
const emit = defineEmits<{ remove: [] }>();
// Without a name there is nothing to match on, so the pill reads as unset until one is typed.
// A name with no value means "tagged with this at all", which is the common case.
const label = computed(() => {
  if (!tagName.value) return "Tag == all";
  return tagValue.value ? `Tag == ${tagName.value}: ${tagValue.value}` : `Tag == ${tagName.value}`;
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
          <v-text-field v-model="tagName" autofocus density="comfortable" label="Name" :rules="tagNameRules" />
          <v-text-field
            v-model="tagValue"
            density="comfortable"
            hint="Leave empty to match any value"
            label="Value"
            persistent-hint
            :rules="tagValueRules"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
