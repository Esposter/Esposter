<script setup lang="ts">
import type { PageLink } from "@/models/app/PageLink";

import { getPageIcon } from "@/services/app/getPageIcon";

interface Props {
  page: PageLink;
}

const { page } = defineProps<Props>();
const label = computed(() => page.title || page.path);
const icon = computed(() => getPageIcon(page.path));
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :label>
    <NuxtInvisibleLink
      :="activatorProps"
      class="page-link hover:bg-accent/20"
      :to="page.path"
      :aria-label="label"
      flex
      shrink-0
      size-10
      items-center
      justify-center
    >
      <v-icon v-if="icon" :icon size="1.5rem" />
      <UiAvatar v-else :name="label" />
    </NuxtInvisibleLink>
  </UiTooltip>
</template>

<style scoped>
.page-link[aria-current="page"] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  color: var(--ui-accent);
}
</style>
