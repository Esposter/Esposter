<script setup lang="ts">
await useReadDashboard();
</script>

<template>
  <NuxtLayout>
    <v-container h-full fluid>
      <StyledCard flex="!" flex-col size-full>
        <DashboardEditorHeader />
        <DashboardEditorContent />
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>
