<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout name="resource" title="Tags">
    <Head>
      <Title>Resource Tags</Title>
    </Head>
    <v-sheet flex-1>
      <ResourceTagList />
    </v-sheet>
  </NuxtLayout>
</template>
