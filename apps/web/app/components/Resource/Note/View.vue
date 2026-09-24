<script setup lang="ts">
import { getNoteExtensions } from "@/services/resource/note/getNoteExtensions";
import { ResourceType } from "@esposter/db-schema";
import { sanitizeTextHtml } from "@esposter/shared";
import { generateHTML } from "@tiptap/html";

interface Props {
  id: string;
  version?: number;
}

const { id, version } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Note,
  id,
  () =>
    version
      ? $trpc.note.readPublishedVersionContent.query({ id, version })
      : $trpc.note.readPublishedResourceContent.query(id),
  version,
);
// JSON is the source of truth at rest — HTML is generated here and sanitized at the render boundary per
// The `string-utils` standard. @tiptap/html serializes without a browser DOM, so the render is SSR-safe.
const html = computed(() => sanitizeTextHtml(generateHTML(content.doc, getNoteExtensions())));
</script>

<template>
  <article mx-a p-8 max-w-prose ui-body>
    <h1 ui-display>{{ name }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- the note's sanitized HTML -->
    <div class="rich-text-content" v-html="html" />
  </article>
</template>
