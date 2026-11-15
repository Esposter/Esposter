<script setup lang="ts">
import type { UiListItem } from "#src/models/ui/UiListItem";
import type { FilterType } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { FilterTypePlaceholderMap } from "#src/services/message/filter/FilterTypePlaceholderMap";
import { getFilterKeyword } from "#src/services/message/filter/getFilterKeyword";
import { useSearchMessageStore } from "#src/store/message/search/index";
import { FilterTypes } from "@esposter/db-schema";

const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
// Each filter as it is typed, and what it takes after its colon
const items = FilterTypes.map<UiListItem<FilterType>>((filterType) => ({
  description: FilterTypePlaceholderMap[filterType],
  meaning: UiIconMeaning.Filter,
  title: getFilterKeyword(filterType),
  value: filterType,
}));
</script>

<template>
  <section flex flex-col gap-1>
    <h3 text-sm text-muted px-2>Search Options</h3>
    <UiList :items label="Search Options" @select="(filterType) => createFilter(filterType)" />
  </section>
</template>
