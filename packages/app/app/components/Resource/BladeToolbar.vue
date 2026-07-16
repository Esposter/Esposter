<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

interface ResourceBladeToolbarProps {
  activeBlade: string;
  duplicate: () => Promise<void>;
  isLoading?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { activeBlade, duplicate, isLoading, publication, publish, refresh, remove, rename, resource, unpublish } =
  defineProps<ResourceBladeToolbarProps>();
defineSlots<{ prepend?: () => VNode }>();
</script>

<template>
  <v-toolbar pl-4 b-l-1 b-border b-solid>
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <ResourceBladeTitle :active-blade :resource />
    <v-spacer />
    <ResourceBladeActions :duplicate :is-loading :publication :publish :refresh :remove :rename :resource :unpublish />
  </v-toolbar>
</template>
