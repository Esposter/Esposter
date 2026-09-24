<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
</script>

<template>
  <!-- Naming a format here would tie the empty state to the type set in Settings, which is exactly the hidden
    dependency Import lost — and what a reader with nothing in the sheet needs is where importing happens -->
  <UiEmptyState
    description="Import a file from the menu beside the title to get started"
    :meaning="UiIconMeaning.File"
    title="No data yet"
  />
</template>
