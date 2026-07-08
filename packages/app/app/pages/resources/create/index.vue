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
      <v-sheet flex-1 overflow-y-auto>
        <v-container>
          <div py-4 flex flex-col gap-4>
            <span text-h6>Create a resource</span>
            <ResourceCreateGallery />
          </div>
        </v-container>
      </v-sheet>
    </div>
  </NuxtLayout>
</template>
