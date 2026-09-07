<script setup lang="ts">
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
  version?: number;
}

const { id, version } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Webpage,
  id,
  () =>
    version
      ? $trpc.webpage.readPublishedVersionContent.query({ id, version })
      : $trpc.webpage.readPublishedResourceContent.query(id),
  version,
);
// The standalone render is captured at save time, so the published webpage serves without GrapesJS
const srcdoc = `<style>${content.css ?? ""}</style>${content.html ?? ""}`;
</script>

<template>
  <ResourceSrcdocIframe :srcdoc :title="name" />
</template>
