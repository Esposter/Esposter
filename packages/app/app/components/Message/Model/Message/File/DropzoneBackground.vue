<script setup lang="ts">
import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const uploadFiles = useUploadFiles();
const { isOverDropZone } = useDropZone(document, getSynchronizedFunction(uploadFiles));
</script>

<template>
  <v-dialog v-model="isOverDropZone" width="auto">
    <StyledCard p-8 text-center>
      <v-card-title font-bold text-xl pb-0>Upload to {{ roomName }}</v-card-title>
      <v-card-subtitle>You can add comments before uploading.</v-card-subtitle>
    </StyledCard>
  </v-dialog>
</template>
