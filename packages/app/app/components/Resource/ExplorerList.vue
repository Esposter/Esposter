<script setup lang="ts">
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
// The caret collapses the list box so the blade fills the row; persisted so it survives a reload, mobile-default otherwise.
const { smAndDown } = useVDisplay();
const isListCollapsed = useLocalStorage(LocalStorageKey.IsResourceListCollapsed, smAndDown.value);
</script>

<template>
  <div v-if="isListCollapsed" pt-2>
    <StyledTooltipIconButton icon="mdi-chevron-double-right" text="Show list" @click="isListCollapsed = false" />
  </div>
  <div v-else flex flex-col>
    <v-toolbar title="Resources" b-b-1 b-border b-solid>
      <template #prepend>
        <StyledTooltipIconButton icon="mdi-chevron-double-left" text="Hide list" @click="isListCollapsed = true" />
      </template>
    </v-toolbar>
    <ResourceListView :is-searchable="false" />
  </div>
</template>
