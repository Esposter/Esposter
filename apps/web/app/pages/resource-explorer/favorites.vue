<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Favorites">
    <Head>
      <Title>Favorite Resources</Title>
    </Head>
    <ResourceListView :source="ResourceListSource.Favorites" flex-1 min-h-0 ui-body />
  </NuxtLayout>
</template>
