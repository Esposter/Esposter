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
      <div flex-1 overflow-y-auto>
        <v-container>
          <div flex flex-col gap-4 py-4>
            <span text-h6>Create a resource</span>
            <ResourceCreateGallery />
          </div>
        </v-container>
      </div>
    </div>
  </NuxtLayout>
</template>
