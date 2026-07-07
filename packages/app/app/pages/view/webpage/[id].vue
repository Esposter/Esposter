<script setup lang="ts">
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const { content, name } = await getResultAsync(() =>
  $trpc.webpageEditor.readPublishedResourceContent.query(String(route.params.id)),
).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Webpage not found" });
  },
);
// The standalone render is captured at save time, so the published webpage serves without GrapesJS;
// The sandbox allows scripts but blocks same-origin access so published pages cannot touch viewer sessions
const srcdoc = `<style>${content.css ?? ""}</style>${content.html ?? ""}`;
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <iframe border-none h-screen w-full sandbox="allow-scripts" :srcdoc :title="name" />
</template>
