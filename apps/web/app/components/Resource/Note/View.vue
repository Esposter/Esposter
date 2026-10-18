<script setup lang="ts">
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Note,
  id,
  () => $trpc.note.readPublishedResourceContent.query(id),
  (version) => $trpc.note.readPublishedVersionContent.query({ id, version }),
);
// JSON is the source of truth at rest — HTML is generated here and sanitized at the render boundary, so the render
// Is SSR-safe with no browser DOM behind it.
const html = computed(() => renderNoteHtml(content.doc));
</script>

<template>
  <article mx-a p-8 max-w-prose ui-body>
    <h1 ui-display>{{ name }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- the note's sanitized HTML -->
    <div class="rich-text-content" v-html="html" />
  </article>
</template>
