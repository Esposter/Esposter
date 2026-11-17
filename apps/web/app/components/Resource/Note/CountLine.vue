<script setup lang="ts">
import type { NoteTextCounts } from "#src/models/resource/note/NoteTextCounts";
import type { Editor } from "@tiptap/core";

import { pluralize } from "#shared/util/text/pluralize";
import { getNoteTextCounts } from "#src/services/resource/note/getNoteTextCounts";

interface Props {
  editor?: Editor | undefined;
}

const { editor } = defineProps<Props>();
const counts = shallowRef<NoteTextCounts>();
// Tiptap keeps no reactive state of its own, so the line is written from each transaction: a keystroke and a selection
// Both dispatch one. A collapsed selection has no text of its own, so it counts the whole note
watchImmediate(
  () => editor,
  (currentEditor, _previousEditor, onCleanup) => {
    if (!currentEditor) return;

    // A caret move with no edit leaves the document object and the counted range as they were, so it reuses the count
    let counted: { doc: typeof currentEditor.state.doc; from: number; to: number } | undefined;
    const update = () => {
      const { doc, selection } = currentEditor.state;
      const { from, to } = selection.empty ? { from: 0, to: doc.content.size } : selection;
      if (counted?.doc === doc && counted.from === from && counted.to === to) return;

      counted = { doc, from, to };
      counts.value = getNoteTextCounts(doc, from, to);
    };
    currentEditor.on("transaction", update);
    update();
    onCleanup(() => currentEditor.off("transaction", update));
  },
);
</script>

<template>
  <p v-if="counts" text-sm text-muted px-2 py-1>
    {{ counts.words }} {{ pluralize("word", counts.words) }} · {{ counts.characters }}
    {{ pluralize("character", counts.characters) }}
  </p>
</template>
