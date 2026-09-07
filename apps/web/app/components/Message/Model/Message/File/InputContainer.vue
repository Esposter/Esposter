<script setup lang="ts">
import type { ComposerTarget } from "@/models/message/ComposerTarget";

import { useUploadFileStore } from "@/store/message/input/uploadFile";
import { takeOne } from "@esposter/shared";

interface Props {
  target: ComposerTarget;
}

const { target } = defineProps<Props>();
const uploadFileStore = useUploadFileStore();
const { discardUploadFiles, getComposerFiles, getComposerFileUrlMap } = uploadFileStore;
const files = computed(() => getComposerFiles(target));
const composerFileUrlMap = computed(() => getComposerFileUrlMap(target));
</script>

<template>
  <v-container v-if="files.length > 0" fluid pb-0>
    <v-row m-0 flex-nowrap overflow-x-auto>
      <MessageModelMessageFileInput
        v-for="(file, index) of files"
        :key="file.id"
        :file
        :index
        :upload-file-url="composerFileUrlMap.get(file.id)"
        @delete="(index) => discardUploadFiles(target, [takeOne(files, index).id])"
      />
    </v-row>
  </v-container>
</template>
