<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const imageModelValue = ref<File | null>(null);
const imageBase64 = computed(() =>
  imageModelValue.value === null ? null : useBase64(imageModelValue.value).base64.value,
);
watch(imageBase64, (newImageBase64) => {
  modelValue.value = newImageBase64;
});
</script>

<template>
  <v-col self-center flex flex-wrap items-center gap-4 cols="6">
    <v-avatar>
      <v-img v-if="value" :src="value" />
    </v-avatar>
    <v-file-input
      v-if="editMode"
      v-model="imageModelValue"
      my-2
      accept="image/*"
      prepend-icon=""
      prepend-inner-icon="mdi-upload"
      label="Upload image"
      density="compact"
      hide-details
    />
  </v-col>
</template>
