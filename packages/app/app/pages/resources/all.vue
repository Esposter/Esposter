<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="All">
    <Head>
      <Title>All Resources</Title>
    </Head>
    <v-sheet flex-1>
      <ResourceListView :close-to="RoutePath.Resources" />
    </v-sheet>
  </NuxtLayout>
</template>
