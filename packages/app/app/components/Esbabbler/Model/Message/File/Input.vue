<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { UploadFileUrl } from "@/models/esbabbler/file/UploadFileUrl";
import type { OptionMenuItem } from "@/models/esbabbler/message/OptionMenuItem";

interface FileInputProps {
  file: FileEntity;
  index: number;
  uploadFileUrl: UploadFileUrl;
}

const { file, index, uploadFileUrl } = defineProps<FileInputProps>();
const emit = defineEmits<{ delete: [number] }>();
const progressPercentage = computed(() => uploadFileUrl.progress * 100);
const menuItems: OptionMenuItem[] = [
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
              <v-btn m-0="!" rd-none="!" variant="text" :color :icon size="small" :="props" @click="onClick" />
            </template>
          </v-tooltip>
        </div>
      </v-card-title>
      <v-card-text pb-0>
        <v-card h-full rd-4>
          <EsbabblerFileRenderer :file :url="uploadFileUrl.url" is-preview />
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
