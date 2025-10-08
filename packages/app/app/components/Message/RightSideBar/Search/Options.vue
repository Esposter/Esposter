<script setup lang="ts">
import { FilterTypePlaceholderMap } from "@/services/message/FilterTypePlaceholderMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";
import { FilterType, uncapitalize } from "@esposter/shared";

const searchMessageStore = useSearchMessageStore();
const { createFilter } = searchMessageStore;
</script>

<template>
  <v-card-title text-base font-extrabold>Search Options</v-card-title>
  <v-list py-0 density="compact">
    <v-hover v-for="filterType in Object.values(FilterType)" :key="filterType" #default="{ isHovering, props }">
      <v-list-item :="props" @click="createFilter(filterType)">
        <v-list-item-title font-bold>
          {{ uncapitalize(filterType) }}:
          <span font-semibold text-gray>{{ FilterTypePlaceholderMap[filterType] }}</span>
        </v-list-item-title>
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </v-list-item>
    </v-hover>
  </v-list>
</template>
