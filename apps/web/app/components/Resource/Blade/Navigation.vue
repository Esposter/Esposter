<script setup lang="ts">
import type { UiTabLink } from "@/models/ui/UiTabLink";
import type { Resource } from "@esposter/db-schema";

import { getResourceBladeDefinitions } from "@/services/resource/getResourceBladeDefinitions";
import { getResourceBladePath } from "@/services/resource/getResourceBladePath";

interface Props {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<Props>();
const items = computed<UiTabLink[]>(() =>
  getResourceBladeDefinitions(resource.type).map(({ icon, slug, title }) => ({
    icon,
    isCurrent: activeBlade === slug,
    title,
    to: getResourceBladePath(resource.id, slug),
  })),
);
</script>

<!-- A resource's faces as tabs under its title: a handful of them, so a row costs no width the blade could use, and
     its line closes the page header -->
<template>
  <UiTabLinks :items label="Resource blades" />
</template>
