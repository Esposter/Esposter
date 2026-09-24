<script setup lang="ts">
import type { ContentNavigationItem } from "@nuxt/content";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isNext?: true;
  item: ContentNavigationItem;
}

const { isNext, item } = defineProps<Props>();
</script>

<template>
  <NuxtLink :to="item.path" :class="{ 'text-right': isNext }" text-inherit ui-card no-underline flex flex-col gap-1>
    <span v-if="isNext" text-muted flex gap-1 items-center justify-end>
      Next<UiIcon :meaning="UiIconMeaning.Next" />
    </span>
    <span v-else text-muted flex gap-1 items-center><UiIcon :meaning="UiIconMeaning.Previous" />Previous</span>
    <span ui-heading>{{ item.title }}</span>
    <span text-muted>{{ item.description }}</span>
  </NuxtLink>
</template>
