<script setup lang="ts">
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Webpage,
  id,
  () => $trpc.webpage.readPublishedResourceContent.query(id),
  (version) => $trpc.webpage.readPublishedVersionContent.query({ id, version }),
);
// The standalone render is captured at save time, so the published webpage serves without GrapesJS
const srcdoc = `<style>${content.css ?? ""}</style>${content.html ?? ""}`;
// The share preview the owner set over the site's own: an empty one leaves the site's description and logo standing.
// The image is a relative asset url, and an Open Graph image must be absolute, so it resolves against this request
if (content.description) useSeoMeta({ description: content.description, ogDescription: content.description });
if (content.imageUrl) useSeoMeta({ ogImage: new URL(content.imageUrl, useRequestURL()).href });
</script>

<template>
  <ResourceSrcdocIframe :srcdoc :title="name" />
</template>
