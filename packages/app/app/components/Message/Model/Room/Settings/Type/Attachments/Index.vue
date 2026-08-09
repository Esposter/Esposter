<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { RoomInMessage } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { useRoomStore } from "@/store/message/room";
import { MimeCategory } from "@esposter/db-schema";

interface AttachmentsProps {
  room: RoomInMessage;
}

const { room } = defineProps<AttachmentsProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { storeUpdateRoom } = roomStore;
const { executeMutation } = useMutation();
// Owned by the form, not by the row: a rejected save rolls the row back and deliberately leaves what the user
// Entered in the controls, with isDirty still true, so the next blur retries it. The settings panel is still on
// Screen beside the alert, which is what makes the draft worth keeping — never clone the row here
const maxFileSizeBytes = ref(room.maxFileSizeBytes);
const allowedMimeCategories = ref([...room.allowedMimeCategories]);
const maxFileSizeMegabytes = MAX_FILE_REQUEST_SIZE / MEGABYTE;
const categoryItems = Object.values(MimeCategory).map<SelectItemCategoryDefinition<MimeCategory>>((category) => ({
  title: category,
  value: category,
}));
const isDirty = computed(
  () =>
    maxFileSizeBytes.value !== room.maxFileSizeBytes ||
    allowedMimeCategories.value.join(",") !== room.allowedMimeCategories.join(","),
);
const save = async () => {
  if (!isDirty.value) return;

  const input = {
    allowedMimeCategories: allowedMimeCategories.value,
    id: room.id,
    maxFileSizeBytes: maxFileSizeBytes.value,
  };
  await executeMutation(() => $trpc.room.updateRoom.mutate(input), {
    applyOptimistic: () => {
      const snapshot = {
        allowedMimeCategories: room.allowedMimeCategories,
        id: room.id,
        maxFileSizeBytes: room.maxFileSizeBytes,
      };
      storeUpdateRoom(input);
      return () => {
        storeUpdateRoom(snapshot);
      };
    },
    key: room.id,
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
        <div flex flex-col gap-2>
          <div font-semibold>Maximum file size</div>
          <v-text-field
            :model-value="maxFileSizeBytes != null ? maxFileSizeBytes / MEGABYTE : ''"
            :max="maxFileSizeMegabytes"
            density="compact"
            hide-details="auto"
            placeholder="Default"
            type="number"
            min="1"
            suffix="MB"
            @update:model-value="maxFileSizeBytes = $event ? Number($event) * MEGABYTE : null"
            @blur="save()"
            @keydown.enter.prevent="save()"
          />
          <span text-hint>Leave empty to use the platform limit of {{ maxFileSizeMegabytes }} MB.</span>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <div flex flex-col gap-2>
          <div font-semibold>Allowed attachment types</div>
          <v-select
            v-model="allowedMimeCategories"
            :items="categoryItems"
            density="compact"
            hide-details="auto"
            multiple
            @update:model-value="save()"
          />
          <span text-hint>Members can only upload the selected categories.</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
