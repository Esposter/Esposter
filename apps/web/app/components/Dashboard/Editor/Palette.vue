<script setup lang="ts">
import { VisualTypeCategoryDefinitions } from "@/services/dashboard/VisualTypeCategoryDefinitions";
</script>

<!-- The visuals palette is the Visuals region: the shell draws it beside the grid, or as a sheet on a narrow window, where
  the reader opens it. Its tiles add a visual where they are pressed or dropped -->
<template>
  <div p-3 flex flex-1 flex-col gap-3 min-h-0 of-y-auto>
    <section v-for="{ items, title } of VisualTypeCategoryDefinitions" :key="title" flex flex-col gap-2>
      <p text-sm text-muted>{{ title }}</p>
      <div flex flex-wrap gap-2>
        <DashboardPaletteTile
          v-for="{ title: tileTitle, value } of items"
          :key="value"
          :title="tileTitle"
          :type="value"
        />
      </div>
    </section>
  </div>
</template>
