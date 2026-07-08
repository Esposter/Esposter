<script setup lang="ts">
import type { ResourcePublication } from "@esposter/db-schema";

interface ResourcePublishToggleProps {
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
}

const { publication, publish, unpublish } = defineProps<ResourcePublishToggleProps>();
</script>

<template>
  <v-btn v-if="publication" prepend-icon="mdi-cloud-off-outline" variant="tonal" @click="unpublish">Unpublish</v-btn>
  <StyledButton v-else :button-props="{ prependIcon: 'mdi-cloud-upload' }" @click="publish">Publish</StyledButton>
</template>
