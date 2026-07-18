<script setup lang="ts">
import { getNoteExtensions } from "@/services/resource/note/getNoteExtensions";
import { ResourceType } from "@esposter/db-schema";
import { sanitizeTextHtml } from "@esposter/shared";
import { generateHTML } from "@tiptap/core";

interface ResourceNoteViewProps {
  id: string;
  version?: number;
}

const { id, version } = defineProps<ResourceNoteViewProps>();
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
// String-utils standard. generateHTML needs a DOM (ProseMirror DOMSerializer), so the render is client-only.
const html = computed(() => sanitizeTextHtml(generateHTML(content.doc, getNoteExtensions())));
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <v-container>
    <h1 px-4 pt-4>{{ name }}</h1>
    <ClientOnly>
      <div class="rich-text-content" px-4 pb-4 v-html="html" />
    </ClientOnly>
  </v-container>
</template>
