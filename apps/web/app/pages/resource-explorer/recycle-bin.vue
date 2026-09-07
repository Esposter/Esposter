<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Recycle bin">
    <Head>
      <Title>Recycle Bin</Title>
    </Head>
    <ResourceRecycleBin />
  </NuxtLayout>
</template>
