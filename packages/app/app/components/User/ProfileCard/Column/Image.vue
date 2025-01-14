<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { blobToBase64 } from "#shared/util/text/blobToBase64";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const imageModelValue = ref<File | null>(null);
const imageBase64 = computedAsync(
  () => (imageModelValue.value === null ? null : blobToBase64(imageModelValue.value)),
  null,
);

watch(imageBase64, (newImageBase64) => {
  modelValue.value = newImageBase64;
});
</script>

<template>
  <v-col self-center flex flex-wrap items-center gap-4 cols="6">
    <template v-if="editMode">
      <v-avatar>
        <v-img v-if="imageBase64" :src="imageBase64" />
        <v-img v-else-if="value" :src="value" />
      </v-avatar>
      <v-file-input
        v-model="imageModelValue"
        my-2
        accept="image/*"
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        hide-details
        show-size
      />
    </template>
    <v-avatar v-else>
      <v-img v-if="value" :src="value" />
    </v-avatar>
  </v-col>
</template>
