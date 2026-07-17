<script setup lang="ts">
import { getResultAsync } from "@esposter/shared";

interface ResourceEmailViewProps {
  id: string;
}

const { id } = defineProps<ResourceEmailViewProps>();
const { $trpc } = useNuxtApp();
const { content, name } = await getResultAsync(() => $trpc.email.readPublishedResourceContent.query(id)).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Email not found" });
  },
);
// The compiled MJML is captured at save time, so the web view serves it without loading GrapesJS;
// The sandbox blocks same-origin access so a published email cannot touch viewer sessions.
// This is the unpersonalized template — merge-field tokens render as authored, which is what a browser copy is
const srcdoc = content.html ?? "";
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <iframe border-none w-full h="[calc(100dvh-var(--app-bar-height))]" sandbox="allow-scripts" :srcdoc :title="name" />
</template>
