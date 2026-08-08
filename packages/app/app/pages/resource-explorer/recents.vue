<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Recent">
    <Head>
      <Title>Recent Resources</Title>
    </Head>
    <v-sheet flex-1>
      <ResourceListView :source="ResourceListSource.Recents" />
    </v-sheet>
  </NuxtLayout>
</template>
