<script setup lang="ts">
import { useUploadFileStore } from "@/store/message/uploadFile";
import { takeOne } from "@esposter/shared";

const uploadFileStore = useUploadFileStore();
const { removeFileUrl } = uploadFileStore;
const { files, fileUrlMap } = storeToRefs(uploadFileStore);
</script>

<template>
  <v-container v-if="files.length > 0" fluid pb-0>
    <v-row m-0 flex-nowrap overflow-x-auto>
      <MessageModelMessageFileInput
        v-for="(file, index) of files"
        :key="file.id"
        :file
        :index
        :upload-file-url="fileUrlMap.get(file.id)"
        @delete="
          (index) => {
            const { id } = takeOne(files.splice(index, 1));
            removeFileUrl(id);
          }
        "
      />
    </v-row>
  </v-container>
</template>
