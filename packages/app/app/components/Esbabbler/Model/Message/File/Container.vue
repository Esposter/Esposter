<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { getColumnLayout } from "@/services/esbabbler/file/getColumnLayout";

interface FileContainerProps {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview = false, message } = defineProps<FileContainerProps>();
const columnLayout = computed(() => getColumnLayout(message.files.length));
</script>

<template>
  <v-container fluid p-0>
    <v-row m--0.25 max-w-140>
      <v-col v-for="(file, index) in message.files" :key="file.id" p-0.25 :cols="columnLayout[index]">
        <EsbabblerModelMessageFile :column-layout :file :index is-preview :message />
      </v-col>
    </v-row>
  </v-container>
</template>
