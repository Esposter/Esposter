<script setup lang="ts">
import type { FileRendererComponentProps } from "#src/models/message/file/FileRendererComponentProps";

import { getLanguageExtension } from "#src/services/codemirror/getLanguageExtension";
import { uiEditorExtensions } from "#src/services/codemirror/uiEditorExtensions";
import { PREVIEW_MAX_HEIGHT } from "#src/services/message/file/constants";
import { Compartment, EditorState } from "@codemirror/state";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { basicSetup, EditorView } from "codemirror";

interface Props extends FileRendererComponentProps {
  language: string;
}

const { isPreview, language, url } = defineProps<Props>();
const readCode = (fileUrl: string) =>
  getResultAsync(async () => {
    const response = await fetch(fileUrl);
    if (!response.ok)
      throw new InvalidOperationError(Operation.Read, fileUrl, `HTTP ${response.status} ${response.statusText}`);
    return response.text();
  })
    .orTee(console.error)
    .unwrapOr("");
// The text is read before the view exists, and the view is made with it, so nothing writes the document afterwards.
// A sent attachment's bubble mounts before the store mints its url, and a read of an empty url fetches the page the
// Code is shown in, so the read waits for a url and the view is made when the first one lands
let code: string | undefined = url ? await readCode(url) : undefined;
const languageExtensions = computedAsync(() => getLanguageExtension(language), []);
const extensions = computed(() => [...languageExtensions.value, ...uiEditorExtensions]);
const container = useTemplateRef("container");
const compartment = new Compartment();
let view: EditorView | undefined;

const createView = (doc: string) => {
  if (!container.value) return;

  view = new EditorView({
    parent: container.value,
    state: EditorState.create({
      doc,
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
};

watch(
  () => extensions.value,
  (value) => view?.dispatch({ effects: compartment.reconfigure(value) }),
);
watch(
  () => url,
  async (newUrl) => {
    // A url re-minted after the text is read is no change to the file, so the text on screen stays where it is
    if (code !== undefined || !newUrl) return;

    code = await readCode(newUrl);
    if (!view) createView(code);
  },
);

onMounted(() => {
  if (code !== undefined) createView(code);
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
