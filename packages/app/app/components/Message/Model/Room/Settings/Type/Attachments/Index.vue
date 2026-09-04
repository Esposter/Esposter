<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { MimeCategory } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
const editedMaxFileSizeBytes = ref(room.maxFileSizeBytes);
const editedAllowedMimeCategories = ref([...room.allowedMimeCategories]);
const maxFileSizeMegabytes = MAX_FILE_REQUEST_SIZE / MEGABYTE;
const categoryItems = Object.values(MimeCategory).map<SelectItemCategoryDefinition<MimeCategory>>((category) => ({
  title: category,
  value: category,
}));
const isDirty = computed(
  () =>
    editedMaxFileSizeBytes.value !== room.maxFileSizeBytes ||
    editedAllowedMimeCategories.value.join(",") !== room.allowedMimeCategories.join(","),
);
const save = async () => {
  if (!isDirty.value) return;

  await saveRoom({
    allowedMimeCategories: editedAllowedMimeCategories.value,
    maxFileSizeBytes: editedMaxFileSizeBytes.value,
  });
};
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Attachments</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsField
          :hint="`Leave empty to use the platform limit of ${maxFileSizeMegabytes} MB.`"
          title="Maximum file size"
        >
          <v-text-field
            :model-value="editedMaxFileSizeBytes != null ? editedMaxFileSizeBytes / MEGABYTE : ''"
            :max="maxFileSizeMegabytes"
            density="compact"
            placeholder="Default"
            type="number"
            min="1"
            suffix="MB"
            @update:model-value="editedMaxFileSizeBytes = $event ? Number($event) * MEGABYTE : null"
            @blur="save()"
            @keydown.enter.prevent="save()"
          />
        </MessageModelRoomSettingsField>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsField
          hint="Members can only upload the selected categories."
          title="Allowed attachment types"
        >
          <v-select
            v-model="editedAllowedMimeCategories"
            :items="categoryItems"
            density="compact"
            multiple
            @update:model-value="save()"
          />
        </MessageModelRoomSettingsField>
      </v-col>
    </v-row>
  </v-container>
</template>
