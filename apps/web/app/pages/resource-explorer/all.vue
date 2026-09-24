<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="All">
    <Head>
      <Title>All Resources</Title>
    </Head>
    <ResourceListView flex-1 min-h-0 ui-body />
  </NuxtLayout>
</template>
