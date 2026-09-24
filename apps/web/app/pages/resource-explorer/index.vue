<script setup lang="ts">
import { RESOURCE_EXPLORER_DISPLAY_NAME } from "@/services/resource/constants";

definePageMeta({ middleware: "auth" });
useResourceCommands();
</script>

<!-- The portal's landing, in the order a visit runs: find something, make something, or go back to what was open. The
     search is the palette's scope over resources, drawn as the field it opens -->
<template>
  <NuxtLayout name="resource" :title="RESOURCE_EXPLORER_DISPLAY_NAME" is-service-menu-shown>
    <Head>
      <Title>{{ RESOURCE_EXPLORER_DISPLAY_NAME }}</Title>
    </Head>
    <div p-4 flex flex-1 flex-col gap-6 of-y-auto ui-body>
      <AppSearchButton label="Search resources, services, and pages" />
      <ResourceHomeCreateSection />
      <ResourceHomeResourcesSection />
    </div>
  </NuxtLayout>
</template>
