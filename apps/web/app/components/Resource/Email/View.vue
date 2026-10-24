<script setup lang="ts">
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Email,
  id,
  () => $trpc.email.readPublishedResourceContent.query(id),
  (version) => $trpc.email.readPublishedVersionContent.query({ id, version }),
);
// The compiled html is captured at publish, which refuses an email the validator rejects, so the web view serves it
// As it is. This is the unpersonalized template — merge-field tokens render as authored, which is what a browser copy is
const srcdoc = content.html ?? "";
</script>

<template>
  <ResourceSrcdocIframe :srcdoc :title="name" />
</template>
