<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";

import { getColumnLayout } from "@/services/esbabbler/file/getColumnLayout";
import { useMessageStore } from "@/store/esbabbler/message";

interface FileContainerProps {
  files: FileEntity[];
}

const { files } = defineProps<FileContainerProps>();
const messageStore = useMessageStore();
const { downloadFileUrlMap } = storeToRefs(messageStore);
const columnLayout = computed(() => getColumnLayout(files.length));
const getUrl = (fileId: string) => downloadFileUrlMap.value.get(fileId)?.url ?? "";
</script>

<template>
  <v-container v-if="files.length > 0" fluid p-0>
    <v-row m--0.25 max-w-140>
      <v-col v-for="(file, index) in files" :key="file.id" p-0.25 :cols="columnLayout[index]">
        <StyledCard>
          <EsbabblerFileRenderer :file :url="getUrl(file.id)" />
        </StyledCard>
      </v-col>
    </v-row>
  </v-container>
</template>
