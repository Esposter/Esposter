<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";

import { getColumnLayout } from "@/services/esbabbler/file/getColumnLayout";

interface FileContainerProps {
  files: FileEntity[];
  isCreator: boolean;
}

const { files, isCreator } = defineProps<FileContainerProps>();
const columnLayout = computed(() => getColumnLayout(files.length));
</script>

<template>
  <v-container v-if="files.length > 0" fluid p-0>
    <v-row m--0.25 max-w-140>
      <v-col v-for="(file, index) in files" :key="file.id" p-0.25 :cols="columnLayout[index]">
        <EsbabblerModelMessageFile :column-layout :file :index :is-creator />
      </v-col>
    </v-row>
  </v-container>
</template>
