<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const { $client } = useNuxtApp();
const imageModelValue = ref<File | null>(null);
const isLoading = ref(false);
const onFileChange = async (files: File | File[]) => {
  const file = Array.isArray(files) ? files[0] : files;
  isLoading.value = true;

  try {
    const formData = new FormData();
    formData.append("file", file);
    modelValue.value = await $client.user.uploadProfileImage.mutate(formData);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-col flex flex-wrap items-center self-center gap-4 cols="6">
    <template v-if="editMode">
      <v-avatar>
        <v-img v-if="modelValue" :src="modelValue" />
        <v-img v-else-if="value" :src="value" />
      </v-avatar>
      <v-file-input
        v-model="imageModelValue"
        :disabled="isLoading"
        accept="image/*"
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        hide-details
        my-2
        show-size
        @update:model-value="onFileChange"
      />
    </template>
    <v-avatar v-else>
      <v-img v-if="value" :src="value" />
    </v-avatar>
  </v-col>
</template>
