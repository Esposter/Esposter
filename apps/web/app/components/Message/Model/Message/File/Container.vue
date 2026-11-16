<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { getColumnLayout } from "#src/services/message/file/getColumnLayout";

interface Props {
  isPreview?: boolean | undefined;
  message: ClientMessage;
}

const { isPreview = false, message } = defineProps<Props>();
const columnLayout = computed(() => getColumnLayout(message.files.length));
</script>

<template>
  <!-- Discord's mosaic: twelve columns, each attachment spanning its share of a row -->
  <div gap-1 grid cols-12>
    <MessageModelMessageFile
      v-for="(file, index) of message.files"
      :key="file.id"
      :column-layout
      :file
      :index
      :is-preview
      :message
      :style="{ gridColumn: `span ${columnLayout[index]}` }"
    />
  </div>
</template>
