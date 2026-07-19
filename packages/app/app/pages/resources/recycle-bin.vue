<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Recycle Bin</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader title="Recycle bin">
        <template #breadcrumbs>
          <AppBreadcrumbs :crumbs="[{ title: 'All', to: RoutePath.ResourcesAll }]" title="Recycle bin" />
        </template>
      </StyledPageHeader>
      <ResourceRecycleBin />
    </div>
  </NuxtLayout>
</template>
