<script setup lang="ts">
// The caret collapses the list box so the blade fills the row; collapse by default on mobile.
const { smAndDown } = useVDisplay();
const isListCollapsed = ref(smAndDown.value);
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
    <ResourceListView :searchable="false" />
  </div>
</template>
