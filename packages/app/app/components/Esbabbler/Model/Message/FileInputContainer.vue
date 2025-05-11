<script setup lang="ts">
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { OptionMenuItem } from "@/models/esbabbler/message/OptionMenuItem";

import { useMessageInputStore } from "@/store/esbabbler/messageInput";

interface FileInputContainerProps {
  files: FileEntity[];
}

const { files } = defineProps<FileInputContainerProps>();
const emit = defineEmits<{
  delete: [number];
}>();
const messageInputStore = useMessageInputStore();
const { uploadFileUrlMap } = storeToRefs(messageInputStore);
const getUrl = (fileId: string) => uploadFileUrlMap.value.get(fileId)?.url ?? "";
const menuItems: OptionMenuItem<number>[] = [
  {
    color: "error",
    icon: "mdi-delete",
    onClick: (index) => {
      emit("delete", index);
    },
    title: "Delete Attachment",
  },
];
</script>

<template>
  <v-container v-if="files.length > 0" pb-0 fluid>
    <v-row m-0 flex-nowrap overflow-x-auto>
      <v-col v-for="(file, index) in files" :key="file.id" xl="2" lg="3" md="4" sm="6">
        <StyledCard>
          <v-card-title flex justify-end p-0>
            <div class="border-sm">
              <v-tooltip
                v-for="{ icon, shortTitle, title, onClick, color } of menuItems"
                :key="title"
                :text="shortTitle ?? title"
              >
                <template #activator="{ props: tooltipProps }">
                  <v-btn
                    m-0="!"
                    rd-none="!"
                    variant="text"
                    :icon
                    :color
                    size="small"
                    :="tooltipProps"
                    @click="onClick(index)"
                  />
                </template>
              </v-tooltip>
            </div>
          </v-card-title>
          <v-card-text pb-0 px-4>
            <v-card rd-4>
              <EsbabblerFileRenderer :file :url="getUrl(file.id)" />
            </v-card>
          </v-card-text>
          <v-card-actions px-4 text-sm>
            {{ file.filename }}
          </v-card-actions>
        </StyledCard>
      </v-col>
    </v-row>
  </v-container>
</template>
