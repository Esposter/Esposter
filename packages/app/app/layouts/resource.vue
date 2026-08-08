<script setup lang="ts">
interface ResourceProps {
  isHeaderBordered?: true;
  title?: string;
}

const slots = defineSlots<{
  actions?: () => VNode;
  default?: () => VNode;
  filters?: () => VNode;
}>();
const { isHeaderBordered, title } = defineProps<ResourceProps>();
</script>

<!-- The shell every resource page shares: the breadcrumb trail and page title, with the storage meter riding the
     trail's spare width. The meter lives here rather than in the app bar because storage is what this area
     spends — it belongs where uploads happen, not in chrome every route pays for -->
<template>
  <NuxtLayout>
    <div flex flex-col h-full>
      <StyledPageHeader :class="{ 'b-0 b-b-1 b-border b-solid': isHeaderBordered }" :title>
        <template #status>
          <ResourceStorageMeter />
        </template>
        <template v-if="slots.actions" #actions>
          <slot name="actions" />
        </template>
        <template v-if="slots.filters" #filters>
          <slot name="filters" />
        </template>
      </StyledPageHeader>
      <slot />
    </div>
  </NuxtLayout>
</template>
