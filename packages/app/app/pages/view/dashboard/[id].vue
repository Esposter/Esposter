<script setup lang="ts">
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";

const route = useRoute();
const { $trpc } = useNuxtApp();
const { content, name } = await $trpc.dashboard.readPublishedDocumentContent.query(String(route.params.id));
const dashboard = new Dashboard(content);
useSeoMeta({ title: name });
</script>

<template>
  <NuxtLayout>
    <v-container fluid>
      <h1 px-4 pt-4>{{ name }}</h1>
      <Dashboard :visuals="dashboard.visuals" />
    </v-container>
  </NuxtLayout>
</template>
