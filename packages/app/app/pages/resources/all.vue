<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>All Resources</Title>
    </Head>
    <ResourceListView />
  </NuxtLayout>
</template>
