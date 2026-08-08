<script setup lang="ts">
definePageMeta({ middleware: "auth" });
useResourceKeyboardShortcuts();
</script>

<template>
  <NuxtLayout name="resource" title="Resource Explorer">
    <Head>
      <Title>Resource Explorer</Title>
    </Head>
    <v-sheet flex-1 overflow-y-auto>
      <v-container>
        <div py-4 flex flex-col gap-8>
          <div py-4 flex justify-center>
            <ResourceSearchMenu placeholder="Search resources, services, and pages (G+/)" is-inline max-w-176 />
          </div>
          <ResourceHomeCreateCard />
          <ResourceHomeResourcesCard />
        </div>
      </v-container>
    </v-sheet>
    <ResourceSearchDialog />
    <ResourceShortcutsOverlay />
  </NuxtLayout>
</template>
