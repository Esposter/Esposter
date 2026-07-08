<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Create a resource</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader title="Create" />
      <div flex flex-col gap-4 overflow-y-auto pa-6>
        <span text-h6>Create a resource</span>
        <ResourceCreateGallery />
      </div>
    </div>
  </NuxtLayout>
</template>
