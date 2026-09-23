<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
</script>

<!-- Every product, grouped by what it is for. On a narrow screen the bar has no room for the reader's places, so
     they lead the panel instead -->
<template>
  <UiPopover label="Products" :position-area="DOCK_POPOVER_POSITION_AREA" px-0 size-10>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Launcher" />
    </template>
    <template #default="{ close }">
      <AppDockPlaces flex flex-wrap md:hidden @click="close()" />
      <AppProductGroups @select="close()" />
    </template>
  </UiPopover>
</template>
