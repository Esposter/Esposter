<script setup lang="ts">
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Favorites">
    <Head>
      <Title>Favorite Resources</Title>
    </Head>
    <v-sheet flex-1>
      <ResourceListView :source="ResourceListSource.Favorites" />
    </v-sheet>
  </NuxtLayout>
</template>
