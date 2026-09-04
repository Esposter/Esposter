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
// JSON is the source of truth at rest — HTML is generated here and sanitized at the render boundary per the
// String-utils standard. @tiptap/html serializes without a browser DOM, so the render is SSR-safe.
const html = computed(() => sanitizeTextHtml(generateHTML(content.doc, getNoteExtensions())));
</script>

<template>
  <v-container>
    <h1 px-4 pt-4>{{ name }}</h1>
    <div class="rich-text-content" px-4 pb-4 v-html="html" />
  </v-container>
</template>
