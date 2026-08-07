<script setup lang="ts">
interface StyledPageHeaderProps {
  title?: string;
}

const { title } = defineProps<StyledPageHeaderProps>();
const slots = defineSlots<{
  actions?: () => VNode;
  filters?: () => VNode;
}>();
</script>

<!-- Breadcrumb row on top, then the page's own title beside its actions — the title is never repeated as a
     crumb (/docs/platform/breadcrumb-trail) -->
<template>
  <v-toolbar height="auto">
    <div px-4 py-2 flex flex-col gap-2 w-full>
      <AppBreadcrumbs />
      <div flex gap-2 w-full items-center>
        <span v-if="title" text-h6>{{ title }}</span>
        <v-spacer />
        <div v-if="slots.actions" flex flex-wrap gap-2 items-center>
          <slot name="actions" />
        </div>
      </div>
      <div v-if="slots.filters" flex flex-wrap gap-2 w-full items-center>
        <slot name="filters" />
      </div>
    </div>
  </v-toolbar>
</template>
