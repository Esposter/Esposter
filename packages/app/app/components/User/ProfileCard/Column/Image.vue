<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { formRules } from "@/services/vuetify/formRules";

export interface UserProfileCardColumnImageProps {
  editMode: boolean;
  value: Row<RowValueType.Image>["value"];
}

const modelValue = defineModel<Row<RowValueType.Image>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnImageProps>();
const { $trpc } = useNuxtApp();
const isLoading = ref(false);
</script>

<template>
  <v-col flex flex-wrap items-center self-center gap-4 cols="6">
    <template v-if="editMode">
      <v-avatar>
        <v-img v-if="modelValue" :src="modelValue" :alt="modelValue" />
        <v-img v-else-if="value" :src="value" :alt="value" />
      </v-avatar>
      <v-file-input
        :disabled="isLoading"
        :rules="[formRules.requireAtMostMaxFileSize]"
        accept="image/*"
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        hide-details
        my-2
        show-size
        @update:model-value="
          async (files?) => {
            if (!files) return;

            const file = Array.isArray(files) ? files[0] : files;
            isLoading = true;

            try {
              modelValue = await $trpc.user.uploadProfileImage.mutate(file);
            } finally {
              isLoading = false;
            }
          }
        "
      />
    </template>
    <v-avatar v-else>
      <v-img v-if="value" :src="value" :alt="value" />
    </v-avatar>
  </v-col>
</template>
