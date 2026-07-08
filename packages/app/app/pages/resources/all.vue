<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>All Resources</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader title="All" />
      <div flex-1 min-h-0>
        <ResourceListView :close-to="RoutePath.Resources" />
      </div>
    </div>
  </NuxtLayout>
</template>
