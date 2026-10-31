<script setup lang="ts">
import type { ComposerTarget } from "@/models/message/ComposerTarget";
import type { AnyExtension } from "@tiptap/vue-3";

import { MESSAGE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  extraExtensions?: AnyExtension[];
  target: ComposerTarget;
}

const input = defineModel<string>({ required: true });
const { extraExtensions = [], target } = defineProps<Props>();
const { checkIsInputValid, extensions, sendComposerMessage, uploadFiles } = await useComposer(() => target);
const slots = defineSlots<{
  "prepend-footer"?: (props: { uploadFiles: Awaited<ReturnType<typeof useComposer>>["uploadFiles"] }) => VNode;
  "prepend-outer-footer"?: () => VNode;
}>();
</script>

<template>
  <RichTextEditor
    v-model="input"
    :limit="MESSAGE_MAX_LENGTH"
    :extensions="[...extensions, ...extraExtensions]"
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
