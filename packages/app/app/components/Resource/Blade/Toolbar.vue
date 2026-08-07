<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

interface ResourceBladeToolbarProps {
  activeBlade: string;
  duplicate: () => Promise<void>;
  isDuplicatePending?: boolean;
  isLoading?: boolean;
  isPublishPending?: boolean;
  isUnpublishPending?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const {
  activeBlade,
  duplicate,
  isDuplicatePending,
  isLoading,
  isPublishPending,
  isUnpublishPending,
  publication,
  publish,
  refresh,
  remove,
  rename,
  resource,
  unpublish,
} = defineProps<ResourceBladeToolbarProps>();
</script>

<template>
  <v-toolbar pl-4>
    <ResourceBladeTitle :active-blade :resource />
    <v-spacer />
    <ResourceBladeActions
      :duplicate
      :is-duplicate-pending
      :is-loading
      :is-publish-pending
      :is-unpublish-pending
      :publication
      :publish
      :refresh
      :remove
      :rename
      :resource
      :unpublish
    />
  </v-toolbar>
</template>
