<script setup lang="ts">
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(ResourceType.Email, id, () =>
  $trpc.email.readPublishedResourceContent.query(id),
);
// The compiled MJML is captured at save time (publishing rejects an email without it), so the web view
// Serves it without loading GrapesJS. This is the unpersonalized template — merge-field tokens render
// As authored, which is what a browser copy is
const srcdoc = content.html ?? "";
</script>

<template>
  <ResourceSrcdocIframe :srcdoc :title="name" />
</template>
