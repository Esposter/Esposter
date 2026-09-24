<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";

const { counts, error, isPending, refresh } = useReadResourceTagCounts();
// RouterLink resolves `to` by identity, so the routes are built with the rows rather than on every render
const tagItems = computed(() =>
  counts.value.map(({ count, name }) => ({
    count,
    name,
    to: { path: RoutePath.ResourceExplorerAll, query: { tagName: name } },
  })),
);
</script>

<!-- Tags are the grouping this area actually has: a resource carries many, so the portal's Resource groups —
     one container per resource — has no analogue here and is deliberately not invented. A row is a link into
     the list pre-filtered by that tag, which is where sorting, columns and bulk actions already live -->
<template>
  <div p-2 flex flex-col h-full min-w-0 of-y-auto ui-body>
    <div v-if="isPending" flex flex-col gap-2>
      <UiSkeleton v-for="index of 8" :key="index" h-8 />
    </div>
    <UiErrorState v-else-if="error" :error @retry="refresh()" />
    <UiEmptyState
      v-else-if="counts.length === 0"
      description="Tag a resource from its Overview blade and it will show up here."
      :meaning="UiIconMeaning.Bookmark"
      title="No tags yet"
    />
    <nav v-else aria-label="Tags">
      <ul flex flex-col>
        <li v-for="{ count, name, to } of tagItems" :key="name">
          <NuxtLink :to px-2 py-1 ui-item no-underline flex gap-2 items-center>
            <span class="i-mdi:tag-outline" aria-hidden="true" text-muted size-5 />
            <span flex-1 truncate>{{ name }}</span>
            <UiChip>{{ count }}</UiChip>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
