<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

const { counts, error, isLoading, refresh } = useReadResourceTagCounts();

onMounted(() => refresh());
</script>

<!-- Tags are the grouping this area actually has: a resource carries many, so the portal's Resource groups —
     one container per resource — has no analogue here and is deliberately not invented. A row is a link into
     the list pre-filtered by that tag, which is where sorting, columns and bulk actions already live -->
<template>
  <div flex flex-col h-full min-w-0 overflow-y-auto>
    <StyledSkeleton v-if="isLoading" type="list-item@8" />
    <StyledEmptyState
      v-else-if="error"
      icon="mdi-alert-circle-outline"
      title="Something went wrong"
      :description="error"
    >
      <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="refresh()">Retry</v-btn>
    </StyledEmptyState>
    <StyledEmptyState
      v-else-if="counts.length === 0"
      icon="mdi-tag-multiple-outline"
      title="No tags yet"
      description="Tag a resource from its Overview blade and it will show up here."
    />
    <v-list v-else nav>
      <v-list-item
        v-for="{ count, name } of counts"
        :key="name"
        prepend-icon="mdi-tag-outline"
        :title="name"
        :to="{ path: RoutePath.ResourceExplorerAll, query: { tagName: name } }"
      >
        <template #append>
          <v-chip size="small" variant="tonal">{{ count }}</v-chip>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
