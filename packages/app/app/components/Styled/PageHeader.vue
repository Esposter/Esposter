<script setup lang="ts">
interface StyledPageHeaderProps {
  title?: string;
}

const { title } = defineProps<StyledPageHeaderProps>();
const slots = defineSlots<{
  actions?: () => VNode;
  breadcrumbs?: () => VNode;
  filters?: () => VNode;
  identity?: () => VNode;
}>();
</script>

<template>
  <v-toolbar height="auto">
    <div px-4 py-2 flex flex-col gap-2 w-full>
      <div flex gap-2 w-full items-center>
        <slot name="breadcrumbs">
          <AppBreadcrumbs :title />
        </slot>
        <v-spacer />
        <div v-if="slots.actions" flex flex-wrap gap-2 items-center>
          <slot name="actions" />
        </div>
      </div>
      <div v-if="slots.identity || slots.filters" flex flex-wrap gap-2 w-full items-center>
        <slot name="identity" />
        <slot name="filters" />
      </div>
    </div>
  </v-toolbar>
</template>
