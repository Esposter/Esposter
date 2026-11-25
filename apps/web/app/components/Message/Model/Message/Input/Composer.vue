<script setup lang="ts">
import type { ComposerTarget } from "#src/models/message/ComposerTarget";
import type { AnyExtension, FocusPosition } from "@tiptap/vue-3";

import { useInputStore } from "#src/store/message/input/index";
import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  extraExtensions?: AnyExtension[] | undefined;
  // Where the caret lands once the editor is made, which leaves it unfocused when none is named
  focusPosition?: FocusPosition | undefined;
  target: ComposerTarget;
}

const slots = defineSlots<{
  "prepend-footer"?: (props: { uploadFiles: Awaited<ReturnType<typeof useComposer>>["uploadFiles"] }) => VNode;
  "prepend-outer-footer"?: () => VNode;
}>();
const input = defineModel<string>({ required: true });
const { extraExtensions = [], target } = defineProps<Props>();
const inputStore = useInputStore();
const { checkIsInputValid } = inputStore;
const { extensions, sendComposerMessage, uploadFiles } = await useComposer(() => target);
const editorExtensions = computed(() => [...extensions, ...extraExtensions]);
</script>

<template>
  <RichTextEditor
    v-model="input"
    :focus-position
    :limit="MESSAGE_MAX_LENGTH"
    :extensions="editorExtensions"
    @paste="(_editor, files) => uploadFiles(files)"
  >
    <template #prepend-inner-header>
      <MessageModelMessageFileInputContainer :target />
    </template>
    <template #prepend-footer>
      <slot name="prepend-footer" :="{ uploadFiles }" />
    </template>
    <template #append-footer="{ editor }">
      <RichTextEditorCustomAudioRecorderButton @upload-file="(files) => uploadFiles(files)" />
      <MessageModelMessageInputSendMessageButton
        :disabled="!checkIsInputValid(target, editor)"
        @click="
          () => {
            if (!editor) return;
            sendComposerMessage(editor, target);
          }
        "
      />
    </template>
    <template v-if="slots['prepend-outer-footer']" #prepend-outer-footer>
      <slot name="prepend-outer-footer" />
    </template>
  </RichTextEditor>
</template>
