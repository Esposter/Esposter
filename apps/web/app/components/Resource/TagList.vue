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
const emptyState = {
  description: "Tag a resource from its Overview blade and it will show up here.",
  meaning: UiIconMeaning.Tag,
  title: "No tags yet",
};
</script>

<!-- Tags are the grouping this area actually has: a resource carries many, so the portal's Resource groups —
     one container per resource — has no analogue here and is deliberately not invented. A row is a link into
     the list pre-filtered by that tag, which is where sorting, columns and bulk actions already live -->
<template>
  <div p-2 flex flex-col h-full min-w-0 of-y-auto ui-body>
    <UiAsyncBody
      :empty-state
      :error
      :is-empty="counts.length === 0 ? true : undefined"
      :is-pending="isPending ? true : undefined"
      @retry="refresh()"
    >
      <template #loading>
        <div flex flex-col gap-2>
          <UiSkeleton v-for="index of 8" :key="index" h-8 />
        </div>
      </template>
      <nav aria-label="Tags">
        <ul flex flex-col>
          <li v-for="{ count, name, to } of tagItems" :key="name">
            <NuxtLink :to ui-item no-underline>
              <UiItemContent :meaning="UiIconMeaning.Tag" :title="name">
                <template #append>
                  <span text-muted>{{ count }}</span>
                </template>
              </UiItemContent>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </UiAsyncBody>
  </div>
</template>
