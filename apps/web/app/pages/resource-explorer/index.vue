<script setup lang="ts">
definePageMeta({ middleware: "auth" });
useResourceCommands();
</script>

<!-- The portal's landing, in the order a visit runs: find something, make something, or go back to what was open. The
     search is the palette's scope over resources, drawn as the field it opens -->
<template>
  <NuxtLayout name="resource" is-service-menu-shown title="Resource Explorer">
    <Head>
      <Title>Resource Explorer</Title>
    </Head>
    <div p-4 flex flex-1 flex-col gap-8 of-y-auto ui-body>
      <AppSearchButton label="Search resources, services, and pages" />
      <ResourceHomeCreateSection />
      <ResourceHomeResourcesSection />
    </div>
  </NuxtLayout>
</template>
