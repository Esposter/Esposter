<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Recent">
    <Head>
      <Title>Recent Resources</Title>
    </Head>
    <ResourceListView :source="ResourceListSource.Recents" flex-1 min-h-0 ui-body />
  </NuxtLayout>
</template>
