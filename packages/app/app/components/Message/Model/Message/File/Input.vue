<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/table/FileEntity";
import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { Item } from "@/models/shared/Item";

interface FileInputProps {
  file: FileEntity;
  index: number;
  uploadFileUrl?: UploadFileUrl;
}

const { file, index, uploadFileUrl = { progress: 1, url: "" } } = defineProps<FileInputProps>();
const emit = defineEmits<{ delete: [number] }>();
const progressPercentage = computed(() => uploadFileUrl.progress * 100);
const menuItems: Item[] = [
  {
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      emit("delete", index);
    },
    title: "Delete Attachment",
  },
];
</script>

<template>
  <v-col xl="2" lg="3" md="4" sm="6">
    <StyledCard h-full flex flex-col>
      <v-card-title flex justify-end p-0>
        <div class="border-sm">
          <v-tooltip
            v-for="{ icon, shortTitle, title, onClick, color } of menuItems"
            :key="title"
            :text="shortTitle ?? title"
          >
            <template #activator="{ props }">
              <v-btn m-0 :color :icon size="small" tile variant="text" :="props" @click="onClick" />
            </template>
          </v-tooltip>
        </div>
      </v-card-title>
      <v-card-text pb-0>
        <v-card h-full rd-4>
          <MessageFileRenderer :file :url="uploadFileUrl.url" is-preview />
        </v-card>
      </v-card-text>
      <v-card v-if="progressPercentage < 100" pt-4>
        <v-progress-linear :model-value="progressPercentage" color="light-blue" :height="16" striped>
          <template #default="{ value }">
            <strong>{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>
      </v-card>
      <v-card-actions px-4 text-sm>
        {{ file.filename }}
      </v-card-actions>
    </StyledCard>
  </v-col>
</template>
