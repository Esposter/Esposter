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
const profileImageUrl = await useProfileImageUrl();
const imageModelValue = ref<File | null>(null);
const isLoading = ref(false);

watch(imageModelValue, async (newImageModelValue) => {
  if (newImageModelValue) {
    isLoading.value = true;

    try {
      const profileImageData = await newImageModelValue.arrayBuffer();
      await $client.user.uploadProfileImage.mutate(profileImageData);
      modelValue.value = profileImageUrl.value;
    } finally {
      isLoading.value = false;
    }
  } else modelValue.value = null;
});
</script>

<template>
  <v-col flex flex-wrap items-center self-center gap-4 cols="6">
    <template v-if="editMode">
      <v-avatar>
        <v-img v-if="imageModelValue && profileImageUrl" :src="profileImageUrl" />
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
      />
    </template>
    <v-avatar v-else>
      <v-img v-if="value" :src="value" />
    </v-avatar>
  </v-col>
</template>
