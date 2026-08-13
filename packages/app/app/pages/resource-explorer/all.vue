<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="All">
    <Head>
      <Title>All Resources</Title>
    </Head>
    <v-sheet flex-1>
      <ResourceListView />
    </v-sheet>
  </NuxtLayout>
</template>
