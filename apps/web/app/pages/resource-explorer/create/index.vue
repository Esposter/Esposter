<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Create a resource">
    <Head>
      <Title>Create a resource</Title>
    </Head>
    <div p-4 flex-1 of-y-auto>
      <ResourceCreateGallery />
    </div>
  </NuxtLayout>
</template>
