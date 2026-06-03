<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { getColumnLayout } from "@/services/message/file/getColumnLayout";

interface FileContainerProps {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview = false, message } = defineProps<FileContainerProps>();
const columnLayout = computed(() => getColumnLayout(message.files.length));
</script>

<template>
  <v-row no-gutters>
    <v-col v-for="(file, index) of message.files" :key="file.id" p-0.5 :cols="columnLayout[index]">
      <MessageModelMessageFile :column-layout :file :index :is-preview :message />
    </v-col>
  </v-row>
</template>
