<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Create">
    <Head>
      <Title>Create a resource</Title>
    </Head>
    <v-sheet flex-1 overflow-y-auto>
      <v-container>
        <div py-4 flex flex-col gap-4>
          <span text-title-large>Create a resource</span>
          <ResourceCreateGallery />
        </div>
      </v-container>
    </v-sheet>
  </NuxtLayout>
</template>
