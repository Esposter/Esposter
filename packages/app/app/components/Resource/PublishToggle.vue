<script setup lang="ts">
import type { ResourcePublication } from "@esposter/db-schema";

interface ResourcePublishToggleProps {
  isPublishPending?: boolean;
  isUnpublishPending?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
}

const { isPublishPending, isUnpublishPending, publication, publish, unpublish } =
  defineProps<ResourcePublishToggleProps>();
</script>

<template>
  <v-btn
    v-if="publication"
    :disabled="isUnpublishPending"
    :loading="isUnpublishPending"
    prepend-icon="mdi-cloud-off-outline"
    variant="tonal"
    @click="unpublish"
  >
    Unpublish
  </v-btn>
  <StyledButton
    v-else
    :button-props="{ disabled: isPublishPending, loading: isPublishPending, prependIcon: 'mdi-cloud-upload' }"
    @click="publish"
  >
    Publish
  </StyledButton>
</template>
