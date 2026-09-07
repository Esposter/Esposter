<script setup lang="ts">
interface Props {
  isHeaderBordered?: true;
  isServiceMenuShown?: true;
  title?: string;
}

const slots = defineSlots<{
  actions?: () => VNode;
  default?: () => VNode;
  filters?: () => VNode;
}>();
const { isHeaderBordered, isServiceMenuShown, title } = defineProps<Props>();
const isServiceMenuOpen = ref(false);
</script>

<!-- The shell every resource page shares: the breadcrumb trail and page title, with the storage meter riding the
     trail's spare width. The meter lives here rather than in the app bar because storage is what this area
     spends — it belongs where uploads happen, not in chrome every route pays for.
     Home opts the service menu in, and its hamburger rides that same row at the end the trail starts from -->
<template>
  <NuxtLayout>
    <div flex flex-col h-full>
      <StyledPageHeader :class="{ 'b-0 b-b-1 b-border b-solid': isHeaderBordered }" :title>
        <template v-if="isServiceMenuShown" #prepend>
          <StyledTooltipIconButton
            icon="mdi-menu"
            text="Resource menu"
            @click="isServiceMenuOpen = !isServiceMenuOpen"
          />
        </template>
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
      <!-- Relative so the drawer overlays this region alone, leaving the header and the app chrome reachable -->
      <div flex flex-1 min-h-0 relative>
        <ResourceServiceMenu v-if="isServiceMenuShown" v-model="isServiceMenuOpen" />
        <div flex flex-1 flex-col min-w-0>
          <slot />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
