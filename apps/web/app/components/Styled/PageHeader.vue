<script setup lang="ts">
interface Props {
  title?: string;
}

const { title } = defineProps<Props>();
const slots = defineSlots<{
  actions?: () => VNode;
  filters?: () => VNode;
  prepend?: () => VNode;
  status?: () => VNode;
}>();
</script>

<!-- Breadcrumb row on top, carrying any standing readout at its far end so the width the trail leaves is spent
     rather than padded, then the page's own title beside its actions — the title is never repeated as a crumb
     (/docs/platform/breadcrumb-trail). A page whose content already names itself passes no title, and with no
     actions either that row is not rendered at all -->
<template>
  <v-toolbar height="auto">
    <div px-4 py-2 flex flex-col gap-y-2 w-full>
      <div flex gap-x-2 w-full items-center>
        <slot name="prepend" />
        <AppBreadcrumbs />
        <v-spacer />
        <slot name="status" />
      </div>
      <div v-if="title || slots.actions" flex gap-x-2 w-full items-center>
        <span v-if="title" font-bold text-headline-small>{{ title }}</span>
        <v-spacer />
        <div v-if="slots.actions" flex flex-wrap gap-x-2 items-center>
          <slot name="actions" />
        </div>
      </div>
      <div v-if="slots.filters" flex flex-wrap gap-x-2 w-full items-center>
        <slot name="filters" />
      </div>
    </div>
  </v-toolbar>
</template>
