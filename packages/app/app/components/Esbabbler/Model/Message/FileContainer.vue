<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";

import { useMessageStore } from "@/store/esbabbler/message";

interface FileContainerProps {
  files: FileEntity[];
}

const { files } = defineProps<FileContainerProps>();
const messageStore = useMessageStore();
const { downloadFileUrlMap } = storeToRefs(messageStore);
const getUrl = (fileId: string) => downloadFileUrlMap.value.get(fileId)?.url ?? "";
</script>

<template>
  <v-container v-if="files.length > 0" fluid p-0>
    <v-row>
      <v-col v-for="file in files" :key="file.id" xl="2" lg="3" md="4" sm="6">
        <StyledCard rd-4>
          <EsbabblerFileRenderer :file :url="getUrl(file.id)" />
        </StyledCard>
      </v-col>
    </v-row>
  </v-container>
</template>
