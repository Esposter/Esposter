<script setup lang="ts">
import type { CallParticipant } from "@esposter/db-schema";

interface Props {
  knocker: CallParticipant;
}

defineProps<Props>();
</script>

<template>
  <div ui-row>
    <UiItemContent :image="knocker.image ?? undefined" :title="`${knocker.name} wants to join`">
      <template #append>
        <MessageContentCallJoinNoticeKnockerAdmitButton :knocker />
        <MessageContentCallJoinNoticeKnockerDismissButton :knocker />
      </template>
    </UiItemContent>
  </div>
</template>
