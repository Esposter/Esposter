<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { uiEditorExtensions } from "@/services/codemirror/uiEditorExtensions";
import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { Compartment, EditorState } from "@codemirror/state";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { basicSetup, EditorView } from "codemirror";

interface Props extends FileRendererComponentProps {
  language: string;
}

const { isPreview, language, url } = defineProps<Props>();
const code = await getResultAsync(async () => {
  const response = await fetch(url);
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response.text();
})
  .orTee(console.error)
  .unwrapOr("");
const languageExtensions = computedAsync(() => getLanguageExtension(language), []);
const extensions = computed(() => [...languageExtensions.value, ...uiEditorExtensions]);
const container = useTemplateRef("container");
const compartment = new Compartment();
let view: EditorView | undefined;

watch(
  () => extensions.value,
  (value) => view?.dispatch({ effects: compartment.reconfigure(value) }),
);

onMounted(() => {
  if (!container.value) return;

  view = new EditorView({
    parent: container.value,
    state: EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        compartment.of(extensions.value),
        EditorView.editable.of(false),
        EditorState.readOnly.of(true),
        ...(isPreview
          ? [EditorView.theme({ "&": { maxHeight: PREVIEW_MAX_HEIGHT, pointerEvents: "auto", userSelect: "auto" } })]
          : []),
      ],
    }),
  });
});

// A leave transition keeps the attachment on screen after its component unmounts, and destroying the view would empty
// That element at once, so a static copy takes its place until the transition removes the element
onBeforeUnmount(() => {
  if (!view) return;

  view.dom.replaceWith(view.dom.cloneNode(true));
  view.destroy();
});
</script>

<template>
  <div ref="container" of-hidden ui-frame />
</template>
