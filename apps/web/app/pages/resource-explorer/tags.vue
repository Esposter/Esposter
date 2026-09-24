<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Tags">
    <Head>
      <Title>Resource Tags</Title>
    </Head>
    <ResourceTagList flex-1 min-h-0 />
  </NuxtLayout>
</template>
