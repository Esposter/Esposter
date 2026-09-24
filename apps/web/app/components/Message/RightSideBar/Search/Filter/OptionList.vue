<script setup lang="ts">
import type { SearchFilterOption } from "@/models/message/filter/SearchFilterOption";
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SerializableValue } from "@esposter/azure";

interface Props {
  items: SearchFilterOption[];
}

const { items } = defineProps<Props>();
const emit = defineEmits<{ select: [value: SerializableValue] }>();
// A row's value is its option's written out, since a list keys its rows by text; the pick hands back the option's own
const listItems = computed(() =>
  items.map<UiListItem<string>>(({ icon, label, value }) => ({ icon, title: label, value: String(value) })),
);
</script>

<template>
  <UiList
    :items="listItems"
    label="Options"
    @select="
      (value) => {
        const option = items.find((item) => String(item.value) === value);
        if (option) emit('select', option.value);
      }
    "
  />
</template>
