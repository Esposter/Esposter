<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
</script>

<!-- Every product, grouped by what it is for, under the way to keep the page open now among the reader's places. On a
     narrow screen the bar has no room for those places, so they lead the panel as well -->
<template>
  <UiPopover
    label="Places and products"
    :position-area="DOCK_POPOVER_POSITION_AREA"
    :variant="UiButtonVariant.Quiet"
    px-0
    size-10
  >
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Launcher" />
    </template>
    <template #default="{ close }">
      <AppDockBookmarkButton />
      <AppDockPlaces flex flex-wrap md:hidden @click="close()" />
      <AppProductGroups @select="close()" />
    </template>
  </UiPopover>
</template>
