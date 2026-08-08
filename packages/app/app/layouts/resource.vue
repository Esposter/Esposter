<script setup lang="ts">
interface ResourceProps {
  isHeaderBordered?: true;
  isServiceMenuHidden?: true;
  title?: string;
}

const slots = defineSlots<{
  actions?: () => VNode;
  default?: () => VNode;
  filters?: () => VNode;
}>();
const { isHeaderBordered, isServiceMenuHidden, title } = defineProps<ResourceProps>();
// The menu is a rail beside the content on desktop and a dropdown above it where there is no room for one
const { smAndDown } = useVDisplay();
</script>

<!-- The shell every resource page shares: the breadcrumb trail and page title, with the storage meter riding the
     trail's spare width. The meter lives here rather than in the app bar because storage is what this area
     spends — it belongs where uploads happen, not in chrome every route pays for.
     The service menu stands beside the content on every route but the resource page, which brings a blade rail
     of its own — two rails on one screen spends the width the blade itself uses better -->
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
      <div flex flex-1 min-h-0 :class="smAndDown ? 'flex-col' : 'flex-row'">
        <ResourceServiceMenu v-if="!isServiceMenuHidden" />
        <div flex flex-1 flex-col min-w-0>
          <slot />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
