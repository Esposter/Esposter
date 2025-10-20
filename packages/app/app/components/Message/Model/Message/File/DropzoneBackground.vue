<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";

const roomName = useRoomName();
const uploadFiles = useUploadFiles();
const { isOverDropZone } = useDropZone(document, getSynchronizedFunction(uploadFiles));
</script>

<template>
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard text-center p-8>
      <v-card-title font-bold pb-0 text-xl>Upload to {{ roomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
