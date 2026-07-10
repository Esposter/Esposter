<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

interface ResourceBladeToolbarProps {
  activeBlade: string;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { activeBlade, publication, publish, remove, rename, resource, unpublish } =
  defineProps<ResourceBladeToolbarProps>();
</script>

<template>
  <v-toolbar pl-4 b-l-1 b-border b-solid>
    <ResourceBladeTitle :active-blade :resource />
    <v-spacer />
    <ResourceBladeActions :publication :publish :remove :rename :resource :unpublish />
  </v-toolbar>
</template>
