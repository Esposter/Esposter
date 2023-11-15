<script setup lang="ts">
import { SITE_NAME } from "@/services/esposter/constants";

const { $pwa } = useNuxtApp();
</script>

<template>
  <v-dialog v-if="$pwa?.needRefresh" :model-value="true" persistent>
    <StyledCard>
      <v-card-title>A new version of {{ SITE_NAME }} is available!</v-card-title>
      <v-card-actions>
        <v-spacer />
        <StyledButton @click="$pwa.updateServiceWorker()">Refresh</StyledButton>
      </v-card-actions>
    </StyledCard>
  </v-dialog>
</template>
