<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomName } = storeToRefs(roomStore);
const uploadFiles = useUploadFiles();
const { isOverDropZone } = useDropZone(document, getSynchronizedFunction(uploadFiles));
</script>

<template>
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard text-center p-8>
      <v-card-title font-bold pb-0 text-xl>Upload to {{ currentRoomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
